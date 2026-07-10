const fetchNews = async () => {
  const res = await fetch("https://saurav.tech/NewsAPI/top-headlines/category/technology/us.json");
  const data = await res.json();
  console.log("Total articles:", data.articles.length);
  console.log("First article:", data.articles[0]);
}

fetchNews();
