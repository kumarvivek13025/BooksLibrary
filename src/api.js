export const fetchBooks = async (offset, limit, sortBy, searchAuthor = '') => {
    let sortParam;
    switch (sortBy) {
      case 'new':
        sortParam = 'new';
        break;
      case 'old':
        sortParam = 'old';
        break;
      case 'title':
        sortParam = 'title';
        break;
      case 'rating_asc':
        sortParam = 'ratings_sortable asc';
        break;
      case 'rating_desc':
        sortParam = 'ratings_sortable desc';
        break;
      default:
        sortParam = '';
    }
  
    const queryParams = new URLSearchParams({
      q: `publish_year:[2020 TO 2024]${searchAuthor ? ` AND author:"${searchAuthor}"` : ''}`,
      fields: 'title,author_name,first_publish_year,subject,ratings_average',
      sort: sortParam,
      offset,
      limit,
    }).toString();
  
    const response = await fetch(`https://openlibrary.org/search.json?${queryParams}`);
    const data = await response.json();
    return data;
  };
  
  export const fetchAuthorDetails = async (authorName) => {
    const response = await fetch(`https://openlibrary.org/search/authors.json?q=${authorName}`);
    const data = await response.json();
    return data;
  };
  