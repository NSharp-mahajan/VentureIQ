const fetchDevTo = async () => {
  const res = await fetch("https://dev.to/api/articles?tag=ai&per_page=5");
  const data = await res.json();
  console.log("Total articles:", data.length);
  if (data.length > 0) {
    console.log("First article:", data[0].title, data[0].description, data[0].social_image, data[0].published_at);
  }
}
fetchDevTo();
