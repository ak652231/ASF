const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mysql = require('mysql');
const app = express();

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'gym'
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to MySQL database:', err.code);
    console.error('Error message:', err.sqlMessage);
    return;
  }
  console.log('Connected to MySQL database');
    connection.release(); 
});

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/",(req,res)=>{
    res.render("index",{ isHomePage: true });
});

app.get("/user_details", (req, res) => {
    const chosenPlan = req.query.plan; 
    const planType = req.query.type; 
    
    res.render("user_details", { isHomePage:false,chosenPlan:chosenPlan,planType:planType});
});

app.post("/payment",(req, res)=>{
  const fname = req.body.Fname;
  const lname = req.body.Lname;
  const num = req.body.nom;
  const eml = req.body.eml;
  const planType = req.body.plan; 
  const chosenPlan = req.body.duration; 
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting MySQL connection:', err);
      res.status(500).send('Error connecting to database');
      return;
    }
  
    const insertSql = "INSERT INTO userdetails (FirstName, LastName, PhoneNo, Email) VALUES (?, ?, ?, ?)";
    connection.query(insertSql, [fname, lname, num, eml], (insertError, insertResults) => {
      if (insertError) {
        connection.release(); 
        console.error('Error executing INSERT SQL query:', insertError);
        res.status(500).send('Error inserting data into database');
        return;
      }

      const price = "SELECT Cost FROM plans WHERE PlanType = ? AND PlanDuration = ?";
      connection.query(price, [planType, chosenPlan], (selectError, selectResults) => {
        connection.release(); 
        if (selectError) {
          console.error('Error executing SELECT SQL query:', selectError);
          res.status(500).send('Error fetching data from database');
          return;
        }
        if (selectResults.length === 0) {
          res.status(404).send('Plan not found');
          return;
        }

        const amount = selectResults[0].Cost;

        res.render("payment",{isHomePage:false,price:amount});
      });
    });
  });
});

app.listen(3000, function() {
    console.log("Server started on port 3000");
});
//AQP5fHACc3WNlrFoAimegrgokiTnpZLBjMaf4KAhs7aApr498W5Hh8tDWR4cqmmIU-KZV2XVkOXzJ6j2 client id
//ENjMhyCgdYoitZfEe7PpJeZXYvcpRY16_ARQhAux3Mm0RFdfBqKuFKsKDKHzJwyO8xoQmlPexZIz4Ktu  secret
//sb-igbue29829207@business.example.com s b acc
//access_token$sandbox$hc6c6wdjt6gty827$0dd57e01cbe885e6fef6ef53231882a7

//ARcMZAMYKOy2vK0_ElmWU72-U-Jkfkm4Pp6akvMZ24xFPVC27U093sOFXYHAFCZYiEqFryZVL_WECDTj
//EBz-MOyJ5VVQR6EBpwksYK9ivR08VV387zexM9HBJfWDQ3uceui6-9lKhgrZI9cULl7hHe9v8SNEydTI