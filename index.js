import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "1234567",
  port: 5432
});

db.connect();




app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/",async (req, res) => {

  const response = await db.query('SELECT countryCode FROM visitedCountries;');

  var country = [];
  response.rows.forEach((obj) => country.push(obj.countrycode));
  res.render("index.ejs", {countries: country, total: country.length});
});

app.post("/add",async (req,res) => {
  const country = req.body.country;

  const response = await db.query(`SELECT code FROM countries WHERE name = '${country}'`);
  if (response.rows[0]!=undefined) {
    try {
      const command = `INSERT INTO visitedCountries (countryCode) VALUES ('${response.rows[0].code}');`;
      await db.query(command);
      res.redirect("/");
    } catch (error) {

      console.log("Country Already exists");
      const response = await db.query('SELECT countryCode FROM visitedCountries;');

      var countries = [];
      response.rows.forEach((obj) => countries.push(obj.countrycode));

      res.render("index.ejs", {
        countries: countries,
        total: countries.length,
        error: "Country already exists. Please try again"
      });

    }
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
