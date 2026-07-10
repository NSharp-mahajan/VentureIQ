import Parser from 'rss-parser';

const fetchNews = async () => {
  const parser = new Parser();
  const feed = await parser.parseURL("https://news.google.com/rss/search?q=startup+OR+venture+capital&hl=en-US&gl=US&ceid=US:en");
  console.log("Total articles:", feed.items.length);
  console.log("First article:", feed.items[0]);
}

fetchNews();
