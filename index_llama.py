from llama_index import VectorStoreIndex, SimpleDirectoryReader, StorageContext
from llama_index.vector_stores import SimpleVectorStore

# Define the path to the markdown files
path_to_files = "./docs/vault/personal/"

# Load documents using SimpleDirectoryReader
documents = SimpleDirectoryReader(path_to_files).load_data()

# Construct vector store and customize storage context
storage_context = StorageContext.from_defaults(
    vector_store=SimpleVectorStore()
)

# Build index
index = VectorStoreIndex.from_documents(
    documents, storage_context=storage_context
)

index.storage_context.persist("personal_index")


