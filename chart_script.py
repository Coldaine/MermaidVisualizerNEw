import plotly.graph_objects as go
import plotly.io as pio

# Since Mermaid service is unavailable, I'll create a Plotly-based flowchart representation
# Define node positions and connections for the Mermaid tooling architecture

# Node positions (x, y coordinates)
nodes = {
    'Mermaid GitHub Repo': (0, 3),
    'build-mermaid.js Script': (0, 2),
    'Vendor Bundle (ESM)': (0, 1),
    
    'Chrome Extension': (-2, 0),
    'Content Script': (-2, -1),
    'Webpage with Mermaid': (-2, -3),
    
    'Tauri Desktop App': (2, 0),
    'Editor + Preview': (2, -1),
    'Export (SVG/PNG)': (2, -3),
    
    'mermaid.initialize()': (0, -1.5),
    'mermaid.render()': (0, -2.5)
}

# Define colors for different categories
colors = {
    'build': '#B3E5EC',
    'extension': '#A5D6A7', 
    'desktop': '#FFEB8A',
    'shared': '#FFCDD2'
}

# Categorize nodes
node_categories = {
    'Mermaid GitHub Repo': 'build',
    'build-mermaid.js Script': 'build',
    'Vendor Bundle (ESM)': 'shared',
    'Chrome Extension': 'extension',
    'Content Script': 'extension', 
    'Webpage with Mermaid': 'extension',
    'Tauri Desktop App': 'desktop',
    'Editor + Preview': 'desktop',
    'Export (SVG/PNG)': 'desktop',
    'mermaid.initialize()': 'shared',
    'mermaid.render()': 'shared'
}

# Define connections
connections = [
    ('Mermaid GitHub Repo', 'build-mermaid.js Script'),
    ('build-mermaid.js Script', 'Vendor Bundle (ESM)'),
    ('Vendor Bundle (ESM)', 'Chrome Extension'),
    ('Vendor Bundle (ESM)', 'Tauri Desktop App'),
    ('Chrome Extension', 'Content Script'),
    ('Tauri Desktop App', 'Editor + Preview'),
    ('Content Script', 'mermaid.initialize()'),
    ('Editor + Preview', 'mermaid.initialize()'),
    ('mermaid.initialize()', 'mermaid.render()'),
    ('mermaid.render()', 'Webpage with Mermaid'),
    ('mermaid.render()', 'Export (SVG/PNG)')
]

# Create the figure
fig = go.Figure()

# Add connections as lines
for start, end in connections:
    start_pos = nodes[start]
    end_pos = nodes[end]
    
    fig.add_trace(go.Scatter(
        x=[start_pos[0], end_pos[0]], 
        y=[start_pos[1], end_pos[1]],
        mode='lines',
        line=dict(color='#333333', width=2),
        showlegend=False,
        hoverinfo='skip'
    ))
    
    # Add arrowhead
    fig.add_annotation(
        x=end_pos[0], y=end_pos[1],
        ax=start_pos[0], ay=start_pos[1],
        xref='x', yref='y',
        axref='x', ayref='y',
        arrowhead=2, arrowsize=1, arrowwidth=2,
        arrowcolor='#333333',
        showarrow=True,
        text='',
    )

# Add nodes
for node_name, pos in nodes.items():
    category = node_categories[node_name]
    color = colors[category]
    
    fig.add_trace(go.Scatter(
        x=[pos[0]], y=[pos[1]],
        mode='markers+text',
        marker=dict(size=80, color=color, line=dict(width=2, color='#333')),
        text=node_name,
        textposition='middle center',
        textfont=dict(size=10, color='black'),
        showlegend=False,
        name=node_name
    ))

# Add legend
legend_items = [
    ('Build Process', colors['build']),
    ('Extension Path', colors['extension']),
    ('Desktop Path', colors['desktop']),
    ('Shared Components', colors['shared'])
]

for i, (label, color) in enumerate(legend_items):
    fig.add_trace(go.Scatter(
        x=[None], y=[None],
        mode='markers',
        marker=dict(size=15, color=color, line=dict(width=2, color='#333')),
        name=label,
        showlegend=True
    ))

# Update layout
fig.update_layout(
    title='Mermaid Tooling System Architecture',
    showlegend=True,
    legend=dict(orientation='h', yanchor='bottom', y=1.05, xanchor='center', x=0.5),
    xaxis=dict(
        showgrid=False, 
        showticklabels=False, 
        zeroline=False,
        range=[-3, 3]
    ),
    yaxis=dict(
        showgrid=False, 
        showticklabels=False, 
        zeroline=False,
        range=[-4, 4]
    ),
    plot_bgcolor='white',
    paper_bgcolor='white'
)

# Save the chart
fig.write_image('mermaid_architecture.png')
fig.write_image('mermaid_architecture.svg', format='svg')

print("Architecture diagram saved as mermaid_architecture.png and mermaid_architecture.svg")