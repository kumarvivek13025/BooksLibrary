import React, { useState, useEffect } from 'react';
import { fetchBooks, fetchAuthorDetails } from './api';
import './App.css'; // Import the CSS file
import { useAuth0 } from "@auth0/auth0-react";
export default function BookList (){
    const [books, setBooks] = useState([]);
    const [authors, setAuthors] = useState({});
    const [offset, setOffset] = useState(0);
    const [limit, setLimit] = useState(5);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [sortBy, setSortBy] = useState('');
    const [searchAuthor, setSearchAuthor] = useState('');
    

    const { loginWithRedirect,isAuthenticated,logout } = useAuth0();


    useEffect(() => {
      const loadData = async () => {
        setLoading(true);
        try {
          const bookData = await fetchBooks(offset, limit, sortBy, searchAuthor);
          setBooks(bookData.docs);
          setTotal(bookData.numFound);
  
          const authorDetailsPromises = bookData.docs.map((book) => {
            if (book.author_name && book.author_name[0]) {
              return fetchAuthorDetails(book.author_name[0]);
            } else {
              return Promise.resolve({ docs: [] }); // Return an empty object if author_name is undefined
            }
          });
  
          const authorDetails = await Promise.all(authorDetailsPromises);
  
          const authorDetailsMap = authorDetails.reduce((acc, authorData) => {
            if (authorData.docs.length > 0) {
              const authorInfo = authorData.docs[0];
              acc[authorInfo.name] = {
                birth_date: authorInfo.birth_date,
                top_work: authorInfo.top_work,
              };
            }
            return acc;
          }, {});
  
          setAuthors(authorDetailsMap);
        } catch (error) {
          console.error('Failed to fetch data:', error);
        } finally {
          setLoading(false);
        }
      };
  
      loadData();
    }, [offset, limit, sortBy, searchAuthor]);
  
    const handlePageChange = (direction) => {
      setOffset((prevOffset) => {
        const newOffset = direction === 'next' ? prevOffset + limit : prevOffset - limit;
        return Math.max(0, newOffset);
      });
    };
  
    const handleLimitChange = (event) => {
      setLimit(parseInt(event.target.value));
      setOffset(0);
    };
  
    const handleSortChange = (event) => {
      setSortBy(event.target.value);
      setOffset(0); 
    };
  
    const handleAuthorSearch = () => {
      setOffset(0); 
    };
  
    const calculateID = (index) => {
      return index + 1 + offset;
    };
  
    const downloadCSV = () => {
      const csvData = [
        ['ID', 'Rating', 'Author', 'Title', 'First Publish Year', 'Subjects', 'Author Birth Date', 'Author Top Work'],
        ...books.map((book, index) => {
          const authorDetails = authors[book.author_name ? book.author_name[0] : ''] || {};
          return [
            calculateID(index),
            book.ratings_average ?? 'N/A',
            book.author_name ? book.author_name.join(', ') : 'N/A',
            book.title ?? 'N/A',
            book.first_publish_year ?? 'N/A',
            book.subject?.join(', ') ?? 'N/A',
            authorDetails.birth_date ?? 'N/A',
            authorDetails.top_work ?? 'N/A',
          ];
        }),
      ];
  
      const csvContent = csvData.map((row) => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'books.csv');
      document.body.appendChild(link);
      link.click();
    };
  
    return (
      <div>
        <h1>Open Library Books</h1>
        {
           isAuthenticated?(<div className="download-button-container"><button onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>
           Log Out
         </button></div>):(
            <div>
              <div class="content">
              <div class="imagedim">
                <img src="20150115183825-books-reading.jpeg" alt="Book Image" />
              </div>
              <div class="features-box">
                <h2>Admins Dashboard</h2>
                <ul class="features-list">
                  <li>Books Rating</li>
                  <li>Book Title</li>
                  <li>First Publish Year</li>
                  <li>Author Birth Date</li>
                  <li>Author Top Work</li>
                  <li>Sort the books according to newest, oldest, ratings, etc.</li>
                  <li>Download the data in CSV file</li>
                  <li>Search the books by Author Names</li>
                </ul>
              </div>
            </div>
            <hr />
            <br />
            <br />
           <div className="download-button-container">
            <button  onClick={() => loginWithRedirect()}>SignUp/SignIn for Dashboard</button>
           </div>

            </div>)
            
        }
        {
         isAuthenticated?(   
        
        <div>
        <label>
          Items per page:
          <select value={limit} onChange={handleLimitChange}>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
          </select>
        </label>
        <label>
          Sort by:
          <select value={sortBy} onChange={handleSortChange}>
            <option value="">None</option>
            <option value="new">Newest</option>
            <option value="old">Oldest</option>
            <option value="title">Title</option>
            <option value="rating)_asc">Low Rating</option>
            <option value="rating_desc">High Rating</option>
          </select>
        </label>
        <label>
          Search by Author:
          <input type="text" value={searchAuthor} onChange={(e) => setSearchAuthor(e.target.value)} className="author-search-input" />
          <button onClick={handleAuthorSearch}>Search</button>
        </label>
        <div className="download-button-container">
          <button className="download-button" onClick={downloadCSV}>Download as CSV</button>
        </div>
        {loading ? (
          <div className="spinner"></div>
        ) : (
          <>
            <table>
              <thead>
                <tr className="header-row">
                  <th>ID</th>
                  <th>Rating</th>
                  <th>Author</th>
                  <th>Title</th>
                  <th>First Publish Year</th>
                  <th>Subjects</th>
                  <th>Author Birth Date</th>
                  <th>Author Top Work</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book, index) => {
                  const authorDetails = authors[book.author_name ? book.author_name[0] : ''] || {};
                  return (
                    <tr key={book.title}>
                      <td>{calculateID(index)}</td>
                      <td>{book.ratings_average ?? 'N/A'}</td>
                      <td>{book.author_name ? book.author_name.join(', ') : 'N/A'}</td>
                      <td>{book.title ?? 'N/A'}</td>
                      <td>{book.first_publish_year ?? 'N/A'}</td>
                      <td>{book.subject?.join(', ') ?? 'N/A'}</td>
                      <td>{authorDetails.birth_date ?? 'N/A'}</td>
                      <td>{authorDetails.top_work ?? 'N/A'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="pagination-controls">
              <button onClick={() => handlePageChange('prev')} disabled={offset === 0}>
                Previous
              </button>
              <button onClick={() => handlePageChange('next')} disabled={offset + limit >= total}>
                Next
              </button>
            </div>
          </>
        )}
        </div>):(<h1>LogIn For Dashboard</h1>)}
        
      </div>
    );
  };

