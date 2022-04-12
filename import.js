const fs = require('fs/promises');
const Typesense = require('typesense');

const SCHEMA_NAME = "books";
const BOOK_FILE = "/tmp/books.jsonl";

async function main() {
  let client = new Typesense.Client({
    'nodes': [{
      'host': 'localhost', // For Typesense Cloud use xxx.a1.typesense.net
      'port': '8108',      // For Typesense Cloud use 443
      'protocol': 'http'   // For Typesense Cloud use https
    }],
    'apiKey': 'xyz',
    'connectionTimeoutSeconds': 2
  })
  
  let booksSchema = {
    'name': 'books',
    'fields': [
      {'name': 'title', 'type': 'string' },
      {'name': 'authors', 'type': 'string[]', 'facet': true },
  
      {'name': 'publication_year', 'type': 'int32', 'facet': true },
      {'name': 'ratings_count', 'type': 'int32' },
      {'name': 'average_rating', 'type': 'float' }
    ],
    'default_sorting_field': 'ratings_count'
  }
  
  // If this is true, the collection will be 
  // deleted and re-created if it already exists
  const FORCE_REINDEX = true;

  // If the below trycatch block fails,
  // the function will be re indexed
  let reindexNeeded = false;
  const booksInJsonl = await fs.readFile(BOOK_FILE);

  try {
    const collection = await client.collections(SCHEMA_NAME).retrieve();
    console.log('Found existing schema');

    if (
      collection.num_documents !== booksInJsonl.length ||
      FORCE_REINDEX === "true"
    ) {
      console.log('Deleting existing schema...');
      reindexNeeded = true;
      await client.collections(SCHEMA_NAME).delete();
    }
  } catch (error) {
    reindexNeeded = true;  
  }

  if (!reindexNeeded) {
    reindexNeeded = true;
    return true;
  }

  console.log('Creating Schema...');
  await client.collections().create(booksSchema);
  
  try {
    console.log('Indexing...');
    await client.collections(SCHEMA_NAME).documents().import(booksInJsonl);

    console.log('Done indexing');
  } catch (error) {
    console.error(error);
  }
}

main();
