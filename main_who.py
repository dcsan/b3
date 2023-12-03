import yaml
import subprocess
from llama_index import VectorStoreIndex, SimpleDirectoryReader, StorageContext
from llama_index.vector_stores import SimpleVectorStore
from llama_index import load_index_from_storage

import time 

# Rebuild storage context
storage_context = StorageContext.from_defaults(persist_dir="personal_index")

# Load index from the storage context
new_index = load_index_from_storage(storage_context)

# Get the default query engine
query_engine = new_index.as_query_engine()

# Query the index
answer = query_engine.query(f"Tell me about myself")

# Print the response
print(answer)

