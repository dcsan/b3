import yaml
import subprocess
from llama_index import VectorStoreIndex, SimpleDirectoryReader, StorageContext
from llama_index.vector_stores import SimpleVectorStore
from llama_index import load_index_from_storage


# Rebuild storage context
storage_context = StorageContext.from_defaults(persist_dir="personal_index")

# Load index from the storage context
new_index = load_index_from_storage(storage_context)

# Get the default query engine
query_engine = new_index.as_query_engine()

topic = 'electronics'

# Query the index
# personality = query_engine.query("What are their personality traits?")
# opinion = query_engine.query(f"What relates this person to {topic}?")
topics = query_engine.query(f"Please recommend some topics for me to learn in an ordered bullet list")


# Print the response
# print(personality)
# print(opinion)
print(topics)

breakpoint()

# Load the YAML file
with open('autorepos/AutoGPT/ai_settings.yaml', 'r') as file:
    data = yaml.safe_load(file)

# Extract the fields
ai_name = data['ai_name']
api_budget = data['api_budget']

# Create custom variables
ai_purpose = """an AI assistant specialized in doing research on a topic and building a markdown file .md. Given the personality of the user: """
context = f""" {personality} {opinion}"""



# Function to write back to the YAML file
def write_to_yaml(data, filename='autorepos/AutoGPT/ai_settings.yaml'):
    with open(filename, 'w') as file:
        yaml.safe_dump(data, file)

# Update the data
ai_role = ai_purpose + context
data['ai_role'] = ai_purpose + context

data['ai_goals'] = [
    f"Utilize web search capabilities to gather a summary of information on the {topic} as it relates to {context}.",
    "Filter and curate into a single markdown file",
    "Add a summary and tags using '#'"
]

# Write back to the YAML file
write_to_yaml(data)

subprocess.call(["bash", "run_continuous.sh", '-y'], cwd="/home/lightsong/Central/Projects/hackathons/b3vault/autorepos/AutoGPT")

