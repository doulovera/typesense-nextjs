import Head from 'next/head'
import Image from 'next/image'

import { useState, useEffect } from 'react';
import Typesense from 'typesense'

const TYPESENSE_API_KEY = 'xyz';

let client = new Typesense.Client({
  nodes: [{
    host: 'localhost', // For Typesense Cloud use xxx.a1.typesense.net
    port: '8108',      // For Typesense Cloud use 443
    protocol: 'http'   // For Typesense Cloud use https
  }],
  apiKey: TYPESENSE_API_KEY,
  connectionTimeoutSeconds: 2
})

export default function Home() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    client.collections('books')
      .documents()
      .search({
        q: search,
        query_by: 'title,authors', // what fields to search
        sort_by: 'ratings_count:desc', // how to sort the results
        pinned_hits: '80:1', // for result pinning
      })
      .then((searchResults) => {
        setBooks(searchResults.hits);
      })
  }, [search]);

  return (
    <div>
      <Head>
        <title>Typesense App</title>
      </Head>

      <div className='flex max-h-screen w-full'>
        <aside className='w-1/2 bg-blue-200 h-screen'>
          <h1 className='mt-2 text-2xl text-center font-bold'><u>Typesense</u> App with Next</h1>
          <div className='h-5/6 grid place-content-center'>
            <input
              className="border border-black px-8 py-4 rounded-lg text-2xl"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for a movie"
              autoFocus={true}
            />
          </div>
        </aside>
        <main className='overflow-y-auto w-full'>
          <div className="p-10">
            {books?.map((oneBook) => {
              const { document } = oneBook;
              const book = document;
              return (
                <div key={book.id} className="max-w-sm rounded overflow-hidden shadow-lg my-6">
                  <div className="h-64 w-full relative">
                    <Image layout="fill" objectFit='cover' src={book.image_url} alt={book.title} />
                  </div>
                  <div className="px-6 py-4">
                    <div className="font-bold text-xl mb-2">{book.title}</div>
                    <p className="text-gray-700 text-base">
                      <p>Rating: {book.average_rating}</p>
                      <p>Publication: {book.publication_year}</p>
                      <p>ID: {book.id}</p>
                    </p>
                  </div>
                  <div className="px-6 pt-4 pb-2">
                    {
                      book.authors?.map((author) => (
                        <span key={author} className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                          {author}
                        </span>
                      ))
                    }
                  </div>
                </div>
              )
            })}
          </div>
        </main>
      </div>
    </div>
  )
}


/*

{
    "authors": [
        "Suzanne Collins"
    ],
    "average_rating": 4.34,
    "id": "1",
    "image_url": "https://images.gr-assets.com/books/1447303603m/2767052.jpg",
    "publication_year": 2008,
    "ratings_count": 4780653,
    "title": "The Hunger Games"
}

*/