from chromadb import HttpClient

client = HttpClient(host="localhost", port=8000)
print("Collections:", [c.name for c in client.list_collections()])

collection = client.get_or_create_collection("relief_products")
print("Count:", collection.count())

if collection.count() > 0:
    results = collection.peek()
    print("Sample IDs:", results["ids"])
    print("Sample documents:", results["documents"][:3])
else:
    print("❌ No products found in Chroma.")