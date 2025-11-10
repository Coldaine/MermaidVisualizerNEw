"""
Simple Z.ai Proxy Backend for Mermaid Visualizer (Python/Flask)
Handles thinking mode, streaming, and SSE parsing properly
"""

from flask import Flask, request, jsonify, Response, stream_with_context
from flask_cors import CORS
import requests
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Z.ai Configuration
ZAI_API_KEY = os.getenv('ZAI_API_KEY')
ZAI_ENDPOINT = 'https://api.z.ai/api/coding/paas/v4/chat/completions'

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'zai_api_key_configured': bool(ZAI_API_KEY)
    })

@app.route('/api/generate', methods=['POST'])
def generate():
    """
    Generate Mermaid diagram from natural language
    POST /api/generate
    Body: { "prompt": string, "diagramType": string, "useThinking": bool }
    """
    data = request.json
    prompt = data.get('prompt')
    diagram_type = data.get('diagramType', 'flowchart')
    use_thinking = data.get('useThinking', True)

    if not prompt:
        return jsonify({'error': 'Prompt is required'}), 400

    if not ZAI_API_KEY:
        return jsonify({'error': 'ZAI_API_KEY not configured'}), 500

    # Build system prompt
    system_prompt = build_system_prompt(diagram_type)

    # Build request payload
    payload = {
        'model': 'glm-4.6',
        'messages': [
            {'role': 'system', 'content': system_prompt},
            {'role': 'user', 'content': prompt}
        ],
        'temperature': 0.7,
        'max_tokens': 2000,
        'stream': False
    }

    # Add thinking mode if enabled
    if use_thinking:
        payload['thinking'] = {'type': 'enabled'}

    try:
        response = requests.post(
            ZAI_ENDPOINT,
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {ZAI_API_KEY}',
                'Accept-Language': 'en-US,en'
            },
            json=payload,
            timeout=30
        )

        response.raise_for_status()
        data = response.json()

        # Extract generated code
        generated_code = data['choices'][0]['message']['content']
        reasoning_content = data['choices'][0]['message'].get('reasoning_content')

        return jsonify({
            'success': True,
            'code': extract_mermaid_code(generated_code),
            'reasoning': reasoning_content,
            'model': data.get('model'),
            'usage': data.get('usage')
        })

    except requests.exceptions.RequestException as e:
        print(f'Z.ai API Error: {e}')
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/generate/stream', methods=['POST'])
def generate_stream():
    """
    Streaming endpoint for real-time generation
    POST /api/generate/stream
    Body: { "prompt": string, "diagramType": string, "useThinking": bool }
    """
    data = request.json
    prompt = data.get('prompt')
    diagram_type = data.get('diagramType', 'flowchart')
    use_thinking = data.get('useThinking', True)

    if not prompt:
        return jsonify({'error': 'Prompt is required'}), 400

    if not ZAI_API_KEY:
        return jsonify({'error': 'ZAI_API_KEY not configured'}), 500

    system_prompt = build_system_prompt(diagram_type)

    payload = {
        'model': 'glm-4.6',
        'messages': [
            {'role': 'system', 'content': system_prompt},
            {'role': 'user', 'content': prompt}
        ],
        'temperature': 0.7,
        'max_tokens': 2000,
        'stream': True
    }

    if use_thinking:
        payload['thinking'] = {'type': 'enabled'}

    def generate_stream_response():
        """Generator function for SSE streaming"""
        try:
            response = requests.post(
                ZAI_ENDPOINT,
                headers={
                    'Content-Type': 'application/json',
                    'Authorization': f'Bearer {ZAI_API_KEY}',
                    'Accept-Language': 'en-US,en'
                },
                json=payload,
                stream=True,
                timeout=60
            )

            response.raise_for_status()

            # Parse SSE stream
            for line in response.iter_lines():
                if line:
                    line = line.decode('utf-8')
                    if line.startswith('data: '):
                        data = line[6:].strip()

                        if data == '[DONE]':
                            yield 'data: [DONE]\n\n'
                            break

                        try:
                            # Forward the parsed JSON to client
                            parsed = json.loads(data)
                            yield f'data: {json.dumps(parsed)}\n\n'
                        except json.JSONDecodeError:
                            # Skip malformed JSON
                            pass

        except requests.exceptions.RequestException as e:
            print(f'Z.ai Streaming Error: {e}')
            error_data = {'error': str(e)}
            yield f'data: {json.dumps(error_data)}\n\n'

    return Response(
        stream_with_context(generate_stream_response()),
        mimetype='text/event-stream',
        headers={
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        }
    )

def build_system_prompt(diagram_type):
    """Build system prompt based on diagram type"""
    base_prompt = ("You are an expert at creating Mermaid diagrams. Generate ONLY the Mermaid code "
                   "without any explanations, markdown code blocks, or additional text. The code should "
                   "be production-ready and follow Mermaid best practices.")

    type_specific = {
        'flowchart': ("Create a flowchart (use 'flowchart TD' or 'flowchart LR' syntax). Use appropriate "
                      "node shapes: rectangles for processes, diamonds for decisions, circles for start/end."),
        'sequence': ("Create a sequence diagram (use 'sequenceDiagram' syntax). Include participants, "
                     "messages with arrows (->>, -->, ->>), and optional notes."),
        'class': ("Create a class diagram (use 'classDiagram' syntax). Include classes with properties "
                  "and methods, and relationships (inheritance, composition, association)."),
        'state': ("Create a state diagram (use 'stateDiagram-v2' syntax). Include states, transitions, "
                  "and use [*] for start/end states."),
        'er': ("Create an entity-relationship diagram (use 'erDiagram' syntax). Include entities with "
               "attributes and relationships (||--o{, }|--|{, etc.)."),
        'gantt': ("Create a Gantt chart (use 'gantt' syntax). Include title, dateFormat, sections, and "
                  "tasks with start dates and durations.")
    }

    specific = type_specific.get(diagram_type, type_specific['flowchart'])
    return f"{base_prompt}\n\n{specific}"

def extract_mermaid_code(content):
    """Extract clean Mermaid code from AI response"""
    import re

    code = content.strip()

    # Remove markdown code blocks
    code = re.sub(r'^```mermaid\n?', '', code, flags=re.IGNORECASE)
    code = re.sub(r'^```\n?', '', code)
    code = re.sub(r'\n?```$', '', code)

    return code.strip()

if __name__ == '__main__':
    port = int(os.getenv('PORT', 3001))
    print(f'✅ Z.ai Proxy Server running on http://localhost:{port}')
    print('📊 Endpoints:')
    print('   - GET  /health')
    print('   - POST /api/generate')
    print('   - POST /api/generate/stream')
    print(f'\n🔑 Z.ai API Key: {"✓ Configured" if ZAI_API_KEY else "✗ Missing"}')

    app.run(host='0.0.0.0', port=port, debug=os.getenv('DEBUG', 'false').lower() == 'true')
