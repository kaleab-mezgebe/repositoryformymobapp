const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const { connect } = require("mongoose");
const app = express();
const upload = multer(); // Initialize multer middleware
const fs = require("fs");
const moment = require("moment");
const PORT = process.env.PORT || 3000;

// const connection = mysql.createConnection({
//   host: "127.0.0.1",
//   user: "root",
//   password: "",
//   database: "mydb",
// });
// const connection = mysql.createConnection({
//   host: "sql8.freesqldatabase.com",
//   user: "sql8723174",
//   password: "qiHGbyByQP",
//   database: "sql8723174",
// });

const connection = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

// Connect to the MySQL server
connection.connect(function (err) {
  if (err) {
    console.error("Error connecting to MySQL: ", err);
    return;
  }
  console.log("Connected to MySQL");
});
app.use(express.json());
// 1. Login route
app.post("/login", (req, res) => {
  const { username, password, role } = req.body;

  // Query the database to check if the user exists
  connection.query(
    "SELECT * FROM user WHERE username = ? AND password = ? AND role = ?",
    [username, password, role],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
      }

      if (results.length === 0) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // User is authenticated, you can return a JWT token or any other authentication mechanism
      return res.status(200).json({ message: "Login successful" });
    }
  );
});

// Configure multer storage
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "./uploads"); // Set destination folder for uploaded files
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + "-" + file.originalname); // Set unique filename
//   },
// });
// // Configure multer storage the latest was this
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "./uploads"); // Set destination folder for uploaded files
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.originalname); // Use the original filename without the uploads\ prefix
//   },
// });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads"); // Set destination folder for uploaded files
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Use the original filename without the uploads\ prefix
  },
});
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "./uploads/");
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + path.extname(file.originalname));
//   },
// });
// Initialize multer upload middleware with storage configuration
const uploadMiddleware = multer({ storage: storage });

//2.Add New Admin/Data Collector
app.post(
  "/addnewadmin",
  uploadMiddleware.fields([
    { name: "imageOfHeritage", maxCount: 1 },
    { name: "signatureImage", maxCount: 1 },
    { name: "keeperSignatureImage", maxCount: 1 },
  ]),

  function (req, res) {
    // Handle the uploaded files for 'imageOfHeritage', 'signatureImage', and 'keeperSignatureImage' keys
    console.log("Received request at /users endpoint");

    const {
      username,
      password,
      firstName,
      lastName,
      gender,
      email,
      phoneNumber,
      position,
      role,
    } = req.body;

    console.log("Received data from the frontend:", req.body);

    // Check if there's already a row with the given username in the admins table
    connection.query(
      "SELECT * FROM user WHERE username = ?",
      [username],
      function (err, results) {
        if (err) {
          console.error("Error checking for duplicate username: ", err);
          return;
        }

        if (results.length > 0) {
          console.log("Username already exists");
          res.status(400).send("Username already exists");
        } else {
          const sql = `
            INSERT INTO user
            (   username,
                password,
                first_name,
                last_name,
                gender,
                email,
                phone_number,
                position,
                role
             )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

          connection.query(
            sql,
            [
              username,
              password,
              firstName,
              lastName,
              gender,
              email,
              phoneNumber,
              position,
              role,
            ],
            function (err, result) {
              if (err) {
                console.error("Error registering data: ", err);
                res.status(500).send("Error registering data");
              } else {
                console.log("Data registered successfully");
                res.sendStatus(201);
              }
            }
          );
        }
      }
    );
  }
);

//2.1 Add Data Collector
app.post(
  "/addnewDataCollector",

  uploadMiddleware.fields([
    { name: "imageOfHeritage", maxCount: 1 },
    { name: "signatureImage", maxCount: 1 },
    { name: "keeperSignatureImage", maxCount: 1 },
  ]),
  function (req, res) {
    // Handle the uploaded files for 'imageOfHeritage', 'signatureImage', and 'keeperSignatureImage' keys
    console.log("Received request at /users endpoint");

    const {
      username,
      password,
      firstName,
      lastName,
      gender,
      email,
      phoneNumber,
      position,
      role,
      createdBy,
    } = req.body;

    console.log("Received data from the frontend:", req.body);

    // Check if there's already a row with the given username in the admins table
    connection.query(
      "SELECT * FROM user WHERE username = ?",
      [username],
      function (err, results) {
        if (err) {
          console.error("Error checking for duplicate username: ", err);
          return;
        }

        if (results.length > 0) {
          console.log("Username already exists");
          res.status(400).send("Username already exists");
        } else {
          const sql = `
            INSERT INTO user
            (   username,
                password,
                first_name,
                last_name,
                gender,
                email,
                phone_number,
                position,
                role,
                created_by

             )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?)`;

          connection.query(
            sql,
            [
              username,
              password,
              firstName,
              lastName,
              gender,
              email,
              phoneNumber,
              position,
              role,
              createdBy,
            ],
            function (err, result) {
              if (err) {
                console.error("Error registering data: ", err);
                res.status(500).send("Error registering data");
              } else {
                console.log("Data registered successfully");
                res.sendStatus(201);
                // Insert into report table
                const queryInsertReport =
                  "INSERT INTO report (first_name,last_name,datacollector) VALUES (?,?,?)";
                connection.query(
                  queryInsertReport,
                  [firstName, lastName, username],
                  function (err, results) {
                    // You can handle any error here if you need to
                  }
                );
              }
            }
          );
        }
      }
    );
  }
);

// app.post(
//   "/addnewDataCollectorr:",

//   uploadMiddleware.fields([
//     { name: "imageOfHeritage", maxCount: 1 },
//     { name: "signatureImage", maxCount: 1 },
//     { name: "keeperSignatureImage", maxCount: 1 },
//   ]),
//   function (req, res) {
//     // Handle the uploaded files for 'imageOfHeritage', 'signatureImage', and 'keeperSignatureImage' keys
//     console.log("Received request at /users endpoint");
//     const {
//       username,
//       password,
//       firstName,
//       lastName,
//       gender,
//       email,
//       phoneNumber,
//       position,
//       role,
//       createdBy,
//     } = req.body;

//     console.log("Received data from the frontend:", req.body);

//     // Check if there's already a row with the given username in the admins table
//     connection.query(
//       "SELECT * FROM user WHERE username = ?",
//       [username],
//       function (err, results) {
//         if (err) {
//           console.error("Error checking for duplicate username: ", err);
//           return;
//         }

//         if (results.length > 0) {
//           console.log("Username already exists");
//           res.status(400).send("Username already exists");
//         } else {
//           const sql = `
//             INSERT INTO user
//             (   username,
//                 password,
//                 first_name,
//                 last_name,
//                 gender,
//                 email,
//                 phone_number,
//                 position,
//                 role,
//                 created_by

//              )
//             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?)`;

//           connection.query(
//             sql,
//             [
//               username,
//               password,
//               firstName,
//               lastName,
//               gender,
//               email,
//               phoneNumber,
//               position,
//               role,
//               createdBy,
//             ],
//             function (err, result) {
//               if (err) {
//                 console.error("Error registering data: ", err);
//                 res.status(500).send("Error registering data");
//               } else {
//                 console.log("Data registered successfully");
//                 res.sendStatus(201);

//                 // Insert into report table
//                 const queryInsertReport =
//                   "INSERT INTO report (first_name,last_name,datacollector) VALUES (?,?,?)";
//                 connection.query(
//                   queryInsertReport,
//                   [firstName, lastName, username],
//                   function (err, results) {
//                     // You can handle any error here if you need to
//                   }
//                 );
//               }
//             }
//           );
//         }
//       }
//     );
//   }
// );
// 3. Deleting Admin
app.delete("/deleteAdmin/:id", (req, res) => {
  const id = req.params.id;

  const query = "DELETE FROM user WHERE id = ?";
  connection.query(query, [id], (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).json({ message: "Item deleted successfully" });
    }
  });
});

// 4.Get Details Admin and Data Collector
app.get("/updatedatacollector/:id", (req, res) => {
  const userId = req.params.id;
  connection.query(
    "SELECT * FROM user WHERE id = ?",
    [userId],
    (error, results, fields) => {
      if (error) {
        console.error(error);
        res.status(500).send("Error fetching user information");
      } else {
        res.json(results[0]);
      }
    }
  );
});

// 4.1 Get Details Data Collector
app.get("/updatedatacollectorr/:username", (req, res) => {
  const username = req.params.username;
  connection.query(
    "SELECT * FROM user WHERE username = ?",
    [username],
    (error, results, fields) => {
      if (error) {
        console.error(error);
        res.status(500).send("Error fetching user information");
      } else {
        res.json(results[0]);
      }
    }
  );
});
//5.Update Admin and Data Collector
app.put("/updatedatacollector/:id", (req, res) => {
  const userId = req.params.id;
  const {
    first_name,
    last_name,
    gender,
    email,
    phone_number,
    position,
    // role,
    password,
  } = req.body;
  connection.query(
    "UPDATE user SET first_name = ?, last_name = ?, gender = ?, email = ?, phone_number = ?, position = ?, password = ? WHERE id = ?",
    [
      first_name,
      last_name,
      gender,
      email,
      phone_number,
      position,
      // role,
      password,
      userId,
    ],
    (error, results, fields) => {
      if (error) {
        console.error(error);
        res.status(500).send("Error updating user information");
      } else {
        res.json({ message: "User information updated successfully" });
      }
    }
  );
});
//5.Update Data Collector
app.put("/updatedatacollectorr/:username/:updatedby", (req, res) => {
  const updatedby = req.params.updatedby;
  const username = req.params.username;

  const {
    first_name,
    last_name,
    gender,
    email,
    phone_number,
    position,
    password,
  } = req.body;
  connection.query(
    "UPDATE user SET first_name = ?, last_name = ?, gender = ?, email = ?, phone_number = ?, position = ?, password = ? WHERE username = ?",
    [
      first_name,
      last_name,
      gender,
      email,
      phone_number,
      position,
      password,
      username,
    ],
    (error, results, fields) => {
      if (error) {
        console.error(error);
        res.status(500).send("Error updating user information");
      } else {
        res.json({ message: "User information updated successfully" });
      }
    }
  );

  const queryUpdateReport =
    "UPDATE report SET updated_by = ?, updated_on = NOW() WHERE datacollector = ?";
  connection.query(queryUpdateReport, [updatedby, username], (err, results) => {
    // You can handle any error here if you need to
  });
});

// 6.Getting Details of  My Profile of Admin,Data Collector and Core Admin
app.get("/updateMyprofile/:username", (req, res) => {
  const userName = req.params.username;
  connection.query(
    "SELECT * FROM user WHERE username = ?",
    [userName],
    (error, results, fields) => {
      if (error) {
        console.error(error);
        res.status(500).send("Error fetching user information");
      } else {
        res.json(results[0]);
      }
    }
  );
});
//7. Updating My Profile of Admin,Data Collector and Core Admin
app.put("/updateMyprofile/:username", (req, res) => {
  const userName = req.params.username;
  const {
    first_name,
    last_name,
    gender,
    email,
    phone_number,
    position,
    role,
    password,
  } = req.body;
  connection.query(
    "UPDATE user SET first_name = ?, last_name = ?, gender = ?, email = ?, phone_number = ?, position = ?, role = ?, password = ? WHERE username = ?",
    [
      first_name,
      last_name,
      gender,
      email,
      phone_number,
      position,
      role,
      password,
      userName,
    ],
    (error, results, fields) => {
      if (error) {
        console.error(error);
        res.status(500).send("Error updating user information");
      } else {
        res.json({ message: "User information updated successfully" });
      }
    }
  );
});

//8. Getting Data of Admin
app.get("/GetAdmins", (req, res) => {
  const username = req.query.username;
  const query = `SELECT * FROM user WHERE role='Admin'`;
  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error retrieving data:", err);
      res.status(500).json({ error: "Error retrieving data" });
      return;
    }
    res.json(results);
  });
});

//9.Getting Each Admin Data/specific
app.get("/getEachAdmin", (req, res) => {
  const id = req.query.id; // Use id instead of username
  const query = `SELECT * FROM user WHERE id='${id}'`;

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error retrieving data:", err);
      res.status(500).json({ error: "Error retrieving data" });
      return;
    }

    const data = results.map((result) => ({
      ሽም: result.first_name,
      "ሽም ኣቦ": result.last_name,
      ፆታ: result.gender,
      ኢመይል: result.email,
      "ስልኪ ቑፅሪ": result.phone_number,
      ሓላፍነት: result.position,
      "መደብ ስራሕ": result.role,
      "ናይ ተጠቃማይ ሽም/መፍለዪ": result.username,
    }));
    res.json(data);
  });
});

// //10. Deleting data collector
// app.delete("/deleteDataCollector/:username", (req, res) => {
//   const username = req.params.username;

//   const query = "DELETE FROM user WHERE username = ?";
//   connection.query(query, [username], (err, results) => {
//     if (err) {
//       res.status(500).send(err);
//     } else {
//       res.status(200).json({ message: "Item deleted successfully" });
//     }
//   });
// });

//10. Deleting data collector
//10. Deleting data collector
//10. Deleting data collector
app.delete("/deleteDataCollector/:username/:deletedby", (req, res) => {
  const username = req.params.username;
  const deletedby = req.params.deletedby;

  const queryDeleteUser = "DELETE FROM user WHERE username = ?";
  connection.query(queryDeleteUser, [username], (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).json({ message: "Item deleted successfully" });
    }
  });

  const queryUpdateReport =
    "UPDATE report SET deletedby = ?, deleted_on = NOW() WHERE datacollector = ?";
  connection.query(queryUpdateReport, [deletedby, username], (err, results) => {
    // You can handle any error here if you need to
  });
});

// delete_logic.dart

// // backend
// const moment = require("moment");
// app.delete("/deleteDataCollector/:id/:username/:datacollector", (req, res) => {
//   const id = req.params.id;
//   const username = req.params.username;

//   const datacollector = req.params.datacollector;
//   // Get current date and time
//   var now = moment();
//   var currentDateAndTime = now.format("YYYY-MM-DD HH:mm:ss");

//   const query = `DELETE FROM user WHERE id = ?; UPDATE report SET deleted_by = ? , deleted_on = ? WHERE datacollector= ?`;
//   connection.query(
//     query,
//     [id, username, currentDateAndTime, datacollector],
//     (err, results) => {
//       if (err) {
//         res.status(500).send(err);
//       } else {
//         res.status(200).json({ message: "Item deleted successfully" });
//       }
//     }
//   );
// });

//11. Retrieving Data Collectors
app.get("/GetDatacollector", (req, res) => {
  const username = req.query.username; // Use id instead of username
  const query = `SELECT * FROM user WHERE created_by='${username}'`;
  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error retrieving data:", err);
      res.status(500).json({ error: "Error retrieving data" });
      return;
    }
    res.json(results);
  });
});

// 11.1 getting all data collectors
//11. Retrieving Data Collectors
app.get("/GetDatacollectorr", (req, res) => {
  const username = req.query.username; // Use id instead of username
  const query = `SELECT * FROM user WHERE role='Data Collector'`;
  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error retrieving data:", err);
      res.status(500).json({ error: "Error retrieving data" });
      return;
    }
    res.json(results);
  });
});
// 12. view Each data collector in admin
// app.get("/getEacDataCollector", (req, res) => {
//   const id = req.query.id; // Use id instead of username
//   const query = `SELECT * FROM user WHERE id='${id}'`;

//   connection.query(query, (err, results) => {
//     if (err) {
//       console.error("Error retrieving data:", err);
//       res.status(500).json({ error: "Error retrieving data" });
//       return;
//     }

//     res.json(results);
//   });
// });

// 12. view Each data collector in admin
app.get("/getEacDataCollector", (req, res) => {
  const id = req.query.id; // Use id instead of username
  const query = `SELECT * FROM user WHERE id='${id}'`;

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error retrieving data:", err);
      res.status(500).json({ error: "Error retrieving data" });
      return;
    }
    const data = results.map((result) => ({
      ሽም: result.first_name,
      "ሽም ኣቦ": result.last_name,
      ፆታ: result.gender,
      ኢመይል: result.email,
      "ስልኪ ቑፅሪ": result.phone_number,
      ሓላፍነት: result.position,
      "መደብ ስራሕ": result.role,
      "ናይ ተጠቃማይ ሽም/መፍለዪ": result.username,
      "ብዝስዕብ ኣድሚን ተመዝጊቡ": result.created_by,
    }));
    res.json(data);
  });
});
app.get("/getEacDataCollectorr", (req, res) => {
  const username = req.query.username; // Use id instead of username
  const query = `SELECT * FROM user WHERE username='${username}'`;

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error retrieving data:", err);
      res.status(500).json({ error: "Error retrieving data" });
      return;
    }
    const data = results.map((result) => ({
      ሽም: result.first_name,
      "ሽም ኣቦ": result.last_name,
      ፆታ: result.gender,
      ኢመይል: result.email,
      "ስልኪ ቑፅሪ": result.phone_number,
      ሓላፍነት: result.position,
      "መደብ ስራሕ": result.role,
      "ናይ ተጠቃማይ ሽም/መፍለዪ": result.username,
      "ብዝስዕብ ኣድሚን ተመዝጊቡ": result.created_by,
    }));
    res.json(data);
  });
});

// 12.1 view Each report in core admin
app.get("/report", (req, res) => {
  const username = req.query.username; // Use id instead of username
  const query = `SELECT * FROM report WHERE datacollector='${username}'`;

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error retrieving data:", err);
      res.status(500).json({ error: "Error retrieving data" });
      return;
    }

    const data = results.map((result) => ({
      "ናይ ተጠቃማይ ሽም/መፍለዪ": result.datacollector,

      ሽም: result.first_name,
      "ሽም ኣቦ": result.last_name,
      ፆታ: result.gender,
      "ብዝስዕብ ኣድሚን ተሰሪዙ": result.deletedby,
      "ዝተሰረዘሉ ጊዜ": result.deleted_on,
      "ውልቃዊ ሓበሬታ ብዝስዕብ ኣድሚን ተመሓይሹ": result.updated_by,
      "ውልቃዊ ሓበሬታ ዝተመሓየሸሉ ጊዜ ": result.updated_on,
    }));
    res.json(data);
  });
});

// 12.1 view Each report in core admin
app.get("/reportt", (req, res) => {
  // Use id instead of username
  const query = `SELECT * FROM report`;

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error retrieving data:", err);
      res.status(500).json({ error: "Error retrieving data" });
      return;
    }

    res.json(results);
  });
});
//13. Deleting Movable Data
app.delete("/movableData/:id", (req, res) => {
  const id = req.params.id;

  const query = "DELETE FROM movable_data WHERE id = ?";
  connection.query(query, [id], (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).json({ message: "Item deleted successfully" });
    }
  });
});

//14. Deleting Non Movable Data
app.delete("/deleteNonMovableData/:id", (req, res) => {
  const id = req.params.id;
  const query = "DELETE FROM non_movable_heritage_data WHERE id = ?";
  connection.query(query, [id], (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).json({ message: "Item deleted successfully" });
    }
  });
});

// 15.Inserting Movable Data

app.post(
  "/movableData",
  uploadMiddleware.fields([
    { name: "imageOfHeritage", maxCount: null },
    { name: "descriptiveImage", maxCount: 1 },
  ]),
  function (req, res) {
    // Handle the uploaded files for 'imageOfHeritage' and 'signatureImage' keys
    console.log("Received request at /users endpoint");

    const {
      usernameValue,
      heritageNameValue,
      localNameValue,
      classOfHeritageValue,
      regionValue,
      zoneValue,
      weredaValue,
      tabiaValue,
      kushetValue,
      uniqueNameofThePlace,

      previousServiceValue,
      currentServiceValue,
      givenIDValue,
      heritageOwnerValue,
      otherOwnerValue,
      nameOfHeritageOwnerValue,
      placeOfTheHeritageValue,
      otherPlaceValue,
      nameWhoFindTheHeritageValue,
      dateOfCreationValue,

      wayOfKnowingHeritageAgeValue,
      wayOfHeritageFindingValue,
      currentStatusOfTheHeritageValue,
      heightValue,
      lengthValue,
      breadthValue,
      areaValue,
      diameterValue,
      thicknessValue,

      shapeValue,
      colorValue,
      numberOfPagesValue,
      numberOfWordsValue,
      numberOfPhrasesValue,
      numberOfPicturesValue,
      numberPillarsValue,
      decorationValue,
      hasDecorationValue,
      madeFromValue,

      madeFromOtherValue,
      shortDescriptionOfHeritageValue,
      uniquenessOfHeritageValue,
      otherUniquenessOfHeritageValue,
      significanceOfHeritageValue,
      statusOfTheHeritageValue,
      ifDestructedDescriptionOfHeritageDestructionValue,
      conditionOfHeritageDestructionValue,
      descriptionConditionOfHeritageDestructionValue,
      maintainedOnValue,

      maintenanceValue,
      reasonOfMaintenanceValue,
      maintainedByValue,
      numberOfMaintenanceValue,
      evaluationOnMaintenanceValue,
      evaluationAnswerDescriptionValue,
      startingDateOfSinceAdministeredByCurrentOwnerValue,
      accessibilityOfHeritageValue,
      descriptionOfAccessibilityHeritageValue,
      typesEvidencesValue,

      ifOtherTypeEvidenceValue,
      heritageInformantNameValue,
      genderValue,
      ageValue,
      workResponsibilityValue,
      otherInformationValue,
      nameOfDataCollector,
      nameOfOrganization,
      position,

      role,
      registrationDateOfHeritageValue,
      // signatureValue,
    } = req.body;

    console.log("Received data from the frontend:", req.body);
    //   const dob = new Date(dateOfBirth);

    const dateOfCreation = new Date(dateOfCreationValue);
    const maintainedOn = new Date(maintainedOnValue);
    const startingDateOfSinceAdministeredByCurrentOwner = new Date(
      startingDateOfSinceAdministeredByCurrentOwnerValue
    );
    const registrationDateOfHeritage = new Date(
      registrationDateOfHeritageValue
    );

    console.log(dateOfCreation);
    console.log(maintainedOn);
    console.log(startingDateOfSinceAdministeredByCurrentOwner);
    console.log(registrationDateOfHeritage);
    let classOfHeritageArray = classOfHeritageValue;

    if (!Array.isArray(classOfHeritageArray)) {
      classOfHeritageArray = [classOfHeritageArray]; // Convert to array
    }

    const classOfHeritage = classOfHeritageArray.join("፣");

    let madeFromArray = madeFromValue;

    if (!Array.isArray(madeFromArray)) {
      madeFromArray = [madeFromArray]; // Convert to array
    }

    const madeFrom = madeFromArray.join("፣");

    let uniquenessOfHeritageArray = uniquenessOfHeritageValue;

    if (!Array.isArray(uniquenessOfHeritageArray)) {
      uniquenessOfHeritageArray = [uniquenessOfHeritageArray]; // Convert to array
    }

    const uniquenessOfHeritage = uniquenessOfHeritageArray.join("፣");

    let typesEvidencesArray = typesEvidencesValue;

    if (!Array.isArray(typesEvidencesArray)) {
      typesEvidencesArray = [typesEvidencesArray]; // Convert to array
    }

    const typesEvidences = typesEvidencesArray.join("፣");
    // Get the image file path
    // const imagePath = req.file ? req.file.path : null;
    // Get the image file paths
    // const imageOfheritagePath = req.files.imageOfHeritage
    //   ? req.files.imageOfHeritage[0].path
    //   : null;

    // let imagePaths = req.files.imageOfHeritage.map((file) => file.path);
    // imagePaths = imagePaths.join(",");
    // Get the image file paths
    let imagePaths = "";
    if (req.files && req.files.imageOfHeritage) {
      imagePaths = req.files.imageOfHeritage
        .map((file) => file.originalname)
        .join(",");
    } else {
      imagePaths = "";
    }

    // const signatureValue =
    //   req.files && req.files.signatureImage
    //     ? req.files.signatureImage[0].originalname
    //     : null;
    const descriptiveImageOfHeritageValue =
      req.files && req.files.descriptiveImage
        ? req.files.descriptiveImage[0].originalname
        : null;

    // const signatureValue = req.files.signatureImage
    //   ? req.files.signatureImage[0].path
    //   : null;

    // Insert the user into the database
    // Insert the data into the database
    const sql = `
  INSERT INTO movable_data
  (
      username_of_data_collector,
      descriptive_image_of_heritage,
      heritage_name,
      local_name,
      image_of_heritage,
      class_of_heritage,
      region,
      zone,
      wereda,
      tabia,
      kushet,
      unique_name_place,
      previous_service,
      current_service,

      Given_ID,
      heritage_owner,
      other_owner,
      name_of_heritage_owner,
      place_of_the_heritage,
      other_place,
      name_who_find_the_heritage,
      date_of_creation,
      way_of_knowing_heritage_age,
      way_of_heritage_finding,

      current_status_of_the_heritage,
      height,
      length,
      breadth,
      area,
      diameter,
      thickness,
      shape,
      color,
      number_of_pages,

      number_of_words,
      number_of_phrases,
      number_of_pictures,
      number_pillars,
      decoration,
      has_decoration,
      made_from,
      made_from_other,
      short_description_of_heritage,
      uniqueness_of_heritage,

      other_uniqueness_of_heritage,
      significance_of_heritage,
      status_of_the_heritage,
      if_destructed_description_of_heritage_destruction,
      condition_of_heritage_destruction,
      description_condition_of_heritage_destruction,
      maintenance,
      reason_of_maintenance,
      maintained_by,
      maintained_on,

      number_of_maintenance,
      evaluation_on_maintenance,
      evaluation_answer_description,
      starting_date_of_since_administered_by_current_owner,
      accessibility_of_heritage,
      description_Of_Accessibility_Heritage,
      types_evidences,
      if_other_type_evidence,
      heritage_informant_name,
      gender,
      age,

      work_responsibility,
      other_information,
       name_of_data_collector,
      name_of_organization,

      position,
      role,
      registration_date_of_heritage
      
      )
  VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

    connection.query(
      sql,
      [
        usernameValue,
        descriptiveImageOfHeritageValue,
        heritageNameValue,
        localNameValue,
        imagePaths,
        classOfHeritage,
        regionValue,
        zoneValue,
        weredaValue,
        tabiaValue,
        kushetValue,

        uniqueNameofThePlace,
        previousServiceValue,
        currentServiceValue,
        givenIDValue,
        heritageOwnerValue,
        otherOwnerValue,
        nameOfHeritageOwnerValue,
        placeOfTheHeritageValue,
        otherPlaceValue,
        nameWhoFindTheHeritageValue,

        dateOfCreation,
        wayOfKnowingHeritageAgeValue,
        wayOfHeritageFindingValue,
        currentStatusOfTheHeritageValue,
        heightValue,
        lengthValue,
        breadthValue,
        areaValue,
        diameterValue,
        thicknessValue,

        shapeValue,
        colorValue,
        numberOfPagesValue,
        numberOfWordsValue,
        numberOfPhrasesValue,
        numberOfPicturesValue,
        numberPillarsValue,
        decorationValue,
        hasDecorationValue,
        madeFrom,

        madeFromOtherValue,
        shortDescriptionOfHeritageValue,
        uniquenessOfHeritage,
        otherUniquenessOfHeritageValue,
        significanceOfHeritageValue,
        statusOfTheHeritageValue,
        ifDestructedDescriptionOfHeritageDestructionValue,
        conditionOfHeritageDestructionValue,
        descriptionConditionOfHeritageDestructionValue,
        maintenanceValue,

        reasonOfMaintenanceValue,
        maintainedByValue,
        maintainedOn,
        numberOfMaintenanceValue,
        evaluationOnMaintenanceValue,
        evaluationAnswerDescriptionValue,
        startingDateOfSinceAdministeredByCurrentOwner,
        accessibilityOfHeritageValue,
        descriptionOfAccessibilityHeritageValue,
        typesEvidences,

        ifOtherTypeEvidenceValue,
        heritageInformantNameValue,
        genderValue,
        ageValue,
        workResponsibilityValue,
        otherInformationValue,
        nameOfDataCollector,
        nameOfOrganization,

        position,
        role,
        registrationDateOfHeritage,
      ],
      function (err, result) {
        if (err) {
          console.error("Error registering user: ", err);
          res.status(500).send("Error registering user");
        } else {
          console.log("User registered successfully");
          res.sendStatus(201);
        }
      }
    );
  }
);

// 16.Non Movable Data
app.post(
  "/nonMovableData",
  uploadMiddleware.fields([
    { name: "imageOfHeritage", maxCount: null },
    { name: "descriptiveImage", maxCount: 1 },
  ]),
  function (req, res) {
    // Handle the uploaded files for 'imageOfHeritage', 'signatureImage', and 'keeperSignatureImage' keys
    console.log("Received request at /users endpoint");

    const {
      usernameValue,
      heritageNameValue,
      localNameValue,
      classOfHeritageValue,
      regionValue,
      zoneValue,
      weredaValue,
      tabiaValue,
      kushetValue,
      uniqueNameofThePlace,

      previousServiceValue,
      currentServiceValue,
      givenIDValue,
      heritageOwnerValue,
      otherOwnerValue,
      gpsValue,
      eastValue,
      northValue,
      aboveSeaLevelValue,
      nameOfHeritageOwnerValue,

      nameWhoFindTheHeritageValue,
      dateOfCreationValue,
      wayOfKnowingHeritageAgeValue,
      currentStatusOfTheHeritageValue,
      heightValue,
      lengthValue,
      breadthValue,
      areaValue,
      diameterValue,
      shapeValue,

      numberOfGatesValue,
      numberOfWindowsValue,
      numberOfClassesValue,
      madeFromValue,
      shortDescriptionOfHeritageValue,
      historyValue,
      cultureValue,
      artValue,
      handCraftValue,
      scienceValue,

      otherUniquenessOfHeritageValue,
      significanceOfHeritageValue,
      statusOfTheHeritageValue,
      ifDestructedDescriptionOfHeritageDestructionValue,
      conditionOfHeritageDestructionValue,
      descriptionConditionOfHeritageDestructionValue,
      maintenanceValue,
      reasonOfMaintenanceValue,
      maintainedByValue,
      maintainedOnValue,

      numberOfMaintenanceValue,
      evaluationOnMaintenanceValue,
      evaluationAnswerDescriptionValue,
      startingDateOfSinceAdministeredByCurrentOwnerValue,
      accessibilityOfHeritageValue,
      descriptionOfAccessibilityHeritageValue,
      typesEvidencesValue,
      ifOtherTypeEvidenceValue,
      mythValue,
      ifThereIsMyths,

      keeperNameValue,
      keeperWorkResponsibilityValue,
      heritageInformantNameValue,
      genderValue,
      ageValue,
      workResponsibilityValue,
      otherInformationValue,
      nameOfDataCollector,
      nameOfOrganization,
      position,

      role,
      registrationDateOfHeritageValue,
    } = req.body;

    console.log("Received data from the frontend:", req.body);

    const dateOfCreation = new Date(dateOfCreationValue);
    const maintainedOn = new Date(maintainedOnValue);
    const startingDateOfSinceAdministeredByCurrentOwner = new Date(
      startingDateOfSinceAdministeredByCurrentOwnerValue
    );
    const registrationDateOfHeritage = new Date(
      registrationDateOfHeritageValue
    );

    console.log(dateOfCreation);
    console.log(maintainedOn);
    console.log(startingDateOfSinceAdministeredByCurrentOwner);
    console.log(registrationDateOfHeritage);

    let classOfHeritageArray = classOfHeritageValue.split("፣");
    const classOfHeritage = classOfHeritageArray.join("፣");

    let madeFromArray = madeFromValue.split("፣");
    const madeFrom = madeFromArray.join("፣");

    let typesEvidencesArray = typesEvidencesValue.split("፣");
    const typesEvidences = typesEvidencesArray.join("፣");

    // Get the image file paths
    // const imageOfheritagePath = req.files.imageOfHeritage
    //   ? req.files.imageOfHeritage[0].path
    //   : null;

    // let imagePaths = req.files.imageOfHeritage.map((file) => file.path);
    // imagePaths = imagePaths.join(",");

    // const signatureValue = req.files.signatureImage
    //   ? req.files.signatureImage[0].path
    //   : null;
    // const keeperSignatureValue = req.files.keeperSignatureImage
    //   ? req.files.keeperSignatureImage[0].path
    //   : null;

    let imagePaths = "";
    if (req.files && req.files.imageOfHeritage) {
      imagePaths = req.files.imageOfHeritage
        .map((file) => file.originalname)
        .join(",");
    } else {
      imagePaths = "";
    }
    const descriptiveImageOfHeritageValue =
      req.files && req.files.descriptiveImage
        ? req.files.descriptiveImage[0].originalname
        : null;

    // const signatureValue =
    //   req.files && req.files.signatureImage
    //     ? req.files.signatureImage[0].originalname
    //     : null;

    // const keeperSignatureValue =
    //   req.files && req.files.keeperSignatureImage
    //     ? req.files.keeperSignatureImage[0].originalname
    //     : null;

    const sql = `
  INSERT INTO non_movable_heritage_data
  (
      username_of_data_collector,
            descriptive_image_of_heritage,

      heritage_name,
      local_name,
      image_of_heritage,
      class_of_heritage,
      region,
      zone,
      wereda,
      tabia,
      kushet,

      unique_name_place,
      previous_service,
      current_service,
      Given_ID,
      heritage_owner,
      other_owner,
      gps,
      east,
      _north,
      _above_sea_level,

      name_of_heritage_owner,
      name_who_find_the_heritage,
      date_of_creation,
      way_of_knowing_heritage_age,
      current_status_of_the_heritage,
      height,
      length,
      breadth,
      area,
      diameter,

      shape,
      number_of_gates,
      number_of_windows,
      number_of_classes,
      made_from,
      short_description_of_heritage,
      history,
      culture,
      art,
      hand_craft,

      science,
      other_uniqueness_of_heritage,
      significance_of_heritage,
      status_of_the_heritage,
      if_destructed_description_of_heritage_destruction,
      condition_of_heritage_destruction,
      description_condition_of_heritage_destruction,
      maintenance,
      reason_of_maintenance,
      maintained_by,

      maintained_on,
      number_of_maintenance,
      evaluation_on_maintenance,
      evaluation_answer_description,
      starting_date_of_since_administered_by_current_owner,
      accessibility_of_heritage,
      description_Of_Accessibility_Heritage,
      types_evidences,
      if_other_type_evidence,
      myth,

      if_there_is_myths,
      keeper_name,
      keeper_work_responsibility,
      heritage_informant_name,
    
      gender,
      age,
      work_responsibility,
      other_information,
      name_of_data_collector,
      name_of_organization,

      position,
      role,
      registration_date_of_heritage
      )
  VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

    connection.query(
      sql,
      [
        usernameValue,
        descriptiveImageOfHeritageValue,
        heritageNameValue,
        localNameValue,
        imagePaths,
        classOfHeritage,
        regionValue,
        zoneValue,
        weredaValue,
        tabiaValue,
        kushetValue,

        uniqueNameofThePlace,
        previousServiceValue,
        currentServiceValue,
        givenIDValue,
        heritageOwnerValue,
        otherOwnerValue,
        gpsValue,
        eastValue,
        northValue,
        aboveSeaLevelValue,

        nameOfHeritageOwnerValue,
        nameWhoFindTheHeritageValue,
        dateOfCreation,
        wayOfKnowingHeritageAgeValue,
        currentStatusOfTheHeritageValue,
        heightValue,
        lengthValue,
        breadthValue,
        areaValue,
        diameterValue,

        shapeValue,
        numberOfGatesValue,
        numberOfWindowsValue,
        numberOfClassesValue,
        madeFrom,
        shortDescriptionOfHeritageValue,
        historyValue,
        cultureValue,
        artValue,
        handCraftValue,

        scienceValue,
        otherUniquenessOfHeritageValue,
        significanceOfHeritageValue,
        statusOfTheHeritageValue,
        ifDestructedDescriptionOfHeritageDestructionValue,
        conditionOfHeritageDestructionValue,
        descriptionConditionOfHeritageDestructionValue,
        maintenanceValue,
        reasonOfMaintenanceValue,
        maintainedByValue,

        maintainedOn,
        numberOfMaintenanceValue,
        evaluationOnMaintenanceValue,
        evaluationAnswerDescriptionValue,
        startingDateOfSinceAdministeredByCurrentOwner,
        accessibilityOfHeritageValue,
        descriptionOfAccessibilityHeritageValue,
        typesEvidences,
        ifOtherTypeEvidenceValue,
        mythValue,

        ifThereIsMyths,
        keeperNameValue,
        keeperWorkResponsibilityValue,
        heritageInformantNameValue,
        genderValue,
        ageValue,
        workResponsibilityValue,
        otherInformationValue,
        nameOfDataCollector,
        nameOfOrganization,

        position,
        role,
        registrationDateOfHeritage,
      ],
      function (err, result) {
        if (err) {
          console.error("Error registering data: ", err);
          res.status(500).send("Error registering data");
        } else {
          console.log("Data registered successfully");
          res.sendStatus(201);
        }
      }
    );
  }
);

//17. Get Movable Data
app.get("/getMovableData/:id", (req, res) => {
  const userId = req.params.id;
  connection.query(
    "SELECT * FROM movable_data WHERE id = ?",
    [userId],
    (error, results, fields) => {
      if (error) {
        console.error(error);
        res.status(500).send("Error fetching user information");
      } else {
        res.json(results[0]);
      }
    }
  );
});

//17. Get Movable Data
app.get("/getNonMovableData/:id", (req, res) => {
  const userId = req.params.id;
  connection.query(
    "SELECT * FROM non_movable_heritage_data WHERE id = ?",
    [userId],
    (error, results, fields) => {
      if (error) {
        console.error(error);
        res.status(500).send("Error fetching user information");
      } else {
        res.json(results[0]);
      }
    }
  );
});
//get table of movable data
app.get("/movableDatas/:heritageId", (req, res) => {
  const heritageId = req.params.heritageId;
  const query = `SELECT * FROM movable_data WHERE id = ${heritageId}`;
  console.log("Query:", query);
  connection.query(query, (err, rows) => {
    console.log("Rows:", rows);
    if (err) {
      console.error("error running query:", err);
      res.status(500).send("Failed to load data");
    } else {
      res.json(rows);
    }
  });
});

//18. Getting heritage names of Movable Data
app.get("/getMovableLists/:username", (req, res) => {
  const username = req.params.username;
  const query = `SELECT id,heritage_name FROM movable_data WHERE username_of_data_collector = ?`;
  connection.query(query, [username], (error, results, fields) => {
    if (error) {
      console.error(error);
      res.status(500).send("Error fetching user information");
    } else {
      res.json(results);
    }
  });
});

// 19. Updating Movable Data
app.put("/updateheritage/:id", (req, res) => {
  const id = req.params.id;
  const {
    heritage_name,
    local_name,
    class_of_heritage,
    region,
    zone,
    wereda,
    tabia,
    kushet,
    unique_name_place,
    previous_service,
    current_service,
    Given_ID,
    heritage_owner,
    other_owner,
    name_of_heritage_owner,
    place_of_the_heritage,
    other_place,
    name_who_find_the_heritage,
    date_of_creation,
    way_of_knowing_heritage_age,
    way_of_heritage_finding,
    current_status_of_the_heritage,
    height,
    length,
    breadth,
    area,
    diameter,
    thickness,
    shape,
    color,
    number_of_pages,
    number_of_words,
    number_of_phrases,
    number_of_pictures,
    number_pillars,
    decoration,
    has_decoration,
    made_from,
    made_from_other,
    short_description_of_heritage,
    uniqueness_of_heritage,
    other_uniqueness_of_heritage,
    significance_of_heritage,
    status_of_the_heritage,
    if_destructed_description_of_heritage_destruction,
    condition_of_heritage_destruction,
    description_condition_of_heritage_destruction,
    maintenance,
    reason_of_maintenance,
    maintained_by,
    maintained_on,

    number_of_maintenance,

    evaluation_on_maintenance,

    evaluation_answer_description,

    starting_date_of_since_administered_by_current_owner,

    accessibility_of_heritage,

    description_Of_Accessibility_Heritage,

    types_evidences,

    if_other_type_evidence,

    heritage_informant_name,

    gender,

    age,

    work_responsibility,

    other_information,
    name_of_data_collector,
    name_of_organization,
    role,

    position,
    registration_date_of_heritage,
  } = req.body;
  connection.query(
    `UPDATE movable_data
    SET 
      heritage_name = ?, 
      local_name = ?, 
      class_of_heritage = ?, 
      region = ?, 
      zone = ?, 
      wereda = ?, 
      tabia = ?, 
      kushet = ?, 
      unique_name_place = ?, 
      previous_service = ?, 
      current_service = ?, 
      Given_ID = ?, 
      heritage_owner = ?, 
      other_owner = ?, 
      name_of_heritage_owner = ?, 
      place_of_the_heritage = ?, 
      other_place = ?, 
      name_who_find_the_heritage = ?, 
      date_of_creation = ?, 
      way_of_knowing_heritage_age = ?, 
      way_of_heritage_finding = ?, 
      current_status_of_the_heritage = ?, 
      height = ?, 
      length = ?, 
      breadth = ?, 
      area = ?, 
      diameter = ?, 
      thickness = ?, 
      shape = ?, 
      color = ? , 
      number_of_pages = ? , 
     number_of_words = ? , 
     number_of_phrases = ? ,  
     number_of_pictures= ? ,  
     number_pillars= ? ,  
     decoration= ? ,  
     has_decoration= ? ,  
     made_from= ? ,  
     made_from_other= ? ,  
     short_description_of_heritage= ? ,  
     uniqueness_of_heritage= ? ,  
     other_uniqueness_of_heritage= ? ,  
     significance_of_heritage= ? ,  
     status_of_the_heritage= ? ,  
     if_destructed_description_of_heritage_destruction= ? ,  
     condition_of_heritage_destruction= ? ,  
     description_condition_of_heritage_destruction= ? ,  
     maintenance= ? ,  
     reason_of_maintenance= ? ,  
     maintained_by= ? ,  
     maintained_on= ? ,  
     number_of_maintenance=? ,  
evaluation_on_maintenance=? ,

evaluation_answer_description=? ,

starting_date_of_since_administered_by_current_owner=? ,

accessibility_of_heritage=? ,

description_Of_Accessibility_Heritage=? ,

types_evidences=? ,

if_other_type_evidence=? ,

heritage_informant_name=? ,

gender=? ,

age=? ,

work_responsibility=? ,

other_information=? ,
name_of_data_collector= ?,
    name_of_organization= ?,
    role= ?,
    
    position= ?,
registration_date_of_heritage=?


WHERE id = ?`,
    [
      heritage_name,
      local_name,
      class_of_heritage,
      region,
      zone,
      wereda,
      tabia,
      kushet,
      unique_name_place,
      previous_service,
      current_service,
      Given_ID,
      heritage_owner,
      other_owner,
      name_of_heritage_owner,
      place_of_the_heritage,
      other_place,
      name_who_find_the_heritage,
      date_of_creation,
      way_of_knowing_heritage_age,
      way_of_heritage_finding,
      current_status_of_the_heritage,
      height,
      length,
      breadth,
      area,
      diameter,
      thickness,
      shape,
      color,
      number_of_pages,
      number_of_words,
      number_of_phrases,
      number_of_pictures,
      number_pillars,
      decoration,
      has_decoration,
      made_from,
      made_from_other,
      short_description_of_heritage,
      uniqueness_of_heritage,
      other_uniqueness_of_heritage,
      significance_of_heritage,
      status_of_the_heritage,
      if_destructed_description_of_heritage_destruction,
      condition_of_heritage_destruction,
      description_condition_of_heritage_destruction,
      maintenance,
      reason_of_maintenance,
      maintained_by,
      maintained_on,
      number_of_maintenance,
      evaluation_on_maintenance,
      evaluation_answer_description,
      starting_date_of_since_administered_by_current_owner,
      accessibility_of_heritage,
      description_Of_Accessibility_Heritage,
      types_evidences,
      if_other_type_evidence,
      heritage_informant_name,
      gender,
      age,
      work_responsibility,
      other_information,
      name_of_data_collector,
      name_of_organization,
      role,
      position,
      registration_date_of_heritage,
      id,
    ],
    (error, results, fields) => {
      if (error) {
        console.error(error);
        res.status(500).send("Error updating heritage information");
      } else {
        res.json({ message: "Heritage information updated successfully" });
      }
    }
  );
});
app.put("/messageToDatacollectorMov/:id", (req, res) => {
  const id = req.params.id;
  const messageFromAdmin = req.body.Message_from_Admin;

  // Log the id and messageFromAdmin to the terminal
  console.log("ID:", id);
  console.log("Message from Admin:", messageFromAdmin);

  const query = "UPDATE movable_data SET Message_from_Admin = ? WHERE id = ?";
  connection.query(query, [messageFromAdmin, id], (err, result) => {
    if (err) {
      console.error("Error updating data: ", err);
      return res.status(500).json({ error: "Error updating data" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Movable data not found" });
    }

    res.json({ message: "Movable data updated successfully" });
  });
});

app.put("/messageToDatacollectorNonMov/:id", (req, res) => {
  const id = req.params.id;
  const messageFromAdmin = req.body.Message_from_Admin;

  // Log the id and messageFromAdmin to the terminal
  console.log("ID:", id);
  console.log("Message from Admin:", messageFromAdmin);

  const query =
    "UPDATE non_movable_heritage_data SET Message_from_Admin = ? WHERE id = ?";
  connection.query(query, [messageFromAdmin, id], (err, result) => {
    if (err) {
      console.error("Error updating data: ", err);
      return res.status(500).json({ error: "Error updating data" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Movable data not found" });
    }

    res.json({ message: "Movable data updated successfully" });
  });
});

app.put("/messageToAdminMov/:id", (req, res) => {
  const id = req.params.id;
  const messageToAdmin = req.body.Message_To_Admin;

  // Log the id and messageFromAdmin to the terminal
  console.log("ID:", id);
  console.log("Message To Admin:", messageToAdmin);

  const query = "UPDATE movable_data SET Message_To_Admin = ? WHERE id = ?";
  connection.query(query, [messageToAdmin, id], (err, result) => {
    if (err) {
      console.error("Error updating data: ", err);
      return res.status(500).json({ error: "Error updating data" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Movable data not found" });
    }

    res.json({ message: "Movable data updated successfully" });
  });
});

app.put("/messageToAdminNonMov/:id", (req, res) => {
  const id = req.params.id;
  const messageToAdmin = req.body.Message_To_Admin;

  // Log the id and messageFromAdmin to the terminal
  console.log("ID:", id);
  console.log("Message To Admin:", messageToAdmin);

  const query =
    "UPDATE non_movable_heritage_data SET Message_To_Admin = ? WHERE id = ?";
  connection.query(query, [messageToAdmin, id], (err, result) => {
    if (err) {
      console.error("Error updating data: ", err);
      return res.status(500).json({ error: "Error updating data" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Movable data not found" });
    }

    res.json({ message: "Movable data updated successfully" });
  });
});
//20. Get Non Movable Data in updating Non Movable Data
app.get("/fetchNonMovableData/:id", (req, res) => {
  const userId = req.params.id;
  connection.query(
    "SELECT * FROM non_movable_heritage_data WHERE id = ?",
    [userId],
    (error, results, fields) => {
      if (error) {
        console.error(error);
        res.status(500).send("Error fetching user information");
      } else {
        res.json(results[0]);
      }
    }
  );
});

// 21. Updating Non Movable Data
app.put("/updateNonMovableHeritage/:id", (req, res) => {
  const id = req.params.id;

  const {
    username_of_data_collector,
    heritage_name,
    local_name,
    class_of_heritage,
    region,
    zone,
    wereda,
    tabia,
    kushet,
    unique_name_place,

    previous_service,
    current_service,
    Given_ID,
    heritage_owner,
    other_owner,
    gps,
    east,
    _north,
    _above_sea_level,
    name_of_heritage_owner,

    name_who_find_the_heritage,
    date_of_creation,
    way_of_knowing_heritage_age,
    current_status_of_the_heritage,
    height,
    length,
    breadth,
    area,
    diameter,
    shape,

    number_of_gates,
    number_of_windows,
    number_of_classes,
    made_from,
    short_description_of_heritage,
    history,
    culture,
    art,
    hand_craft,
    science,

    other_uniqueness_of_heritage,
    significance_of_heritage,
    status_of_the_heritage,
    if_destructed_description_of_heritage_destruction,
    condition_of_heritage_destruction,
    description_condition_of_heritage_destruction,
    maintenance,
    reason_of_maintenance,
    maintained_by,
    maintained_on,

    number_of_maintenance,
    evaluation_on_maintenance,
    starting_date_of_since_administered_by_current_owner,
    evaluation_answer_description,
    accessibility_of_heritage,
    description_Of_Accessibility_Heritage,
    types_evidences,
    if_other_type_evidence,
    myth,
    if_there_is_myths,

    keeper_name,
    keeper_work_responsibility,
    heritage_informant_name,
    gender,
    age,
    work_responsibility,
    other_information,
    name_of_data_collector,
    name_of_organization,
    role,

    position,
    registration_date_of_heritage,
  } = req.body;
  connection.query(
    `UPDATE non_movable_heritage_data
    SET 
    username_of_data_collector= ?,
    heritage_name= ?,
    local_name= ?,
    class_of_heritage= ?,
    region= ?,
    zone= ?,
    wereda= ?,
    tabia= ?,
    kushet= ?,
    unique_name_place= ?,

    previous_service= ?,
    current_service= ?,
    Given_ID= ?,
    heritage_owner= ?,
    other_owner= ?,
    gps= ?,
    east= ?,
    _north= ?,
    _above_sea_level= ?,
    name_of_heritage_owner= ?,
    
    name_who_find_the_heritage= ?,
    date_of_creation= ?,
    way_of_knowing_heritage_age= ?,
    current_status_of_the_heritage= ?,
    height= ?,
    length= ?,
    breadth= ?,
    area= ?,
    diameter= ?,
    shape= ?,
    
    number_of_gates= ?,
    number_of_windows= ?,
    number_of_classes= ?,
    made_from= ?,
    short_description_of_heritage= ?,
    history= ?,
    culture= ?,
    art= ?,
    hand_craft= ?,
    science= ?,
    
    other_uniqueness_of_heritage= ?,
    significance_of_heritage= ?,
    status_of_the_heritage= ?,
    if_destructed_description_of_heritage_destruction= ?,
    condition_of_heritage_destruction= ?,
    description_condition_of_heritage_destruction= ?,
    maintenance= ?,
    reason_of_maintenance= ?,
    maintained_by= ?,
        maintained_on= ?,

   
    number_of_maintenance= ?,
    evaluation_on_maintenance= ?,
    starting_date_of_since_administered_by_current_owner= ?,
    evaluation_answer_description= ?,
    accessibility_of_heritage= ?,
    description_Of_Accessibility_Heritage= ?,
    types_evidences= ?,
        if_other_type_evidence= ?,

    myth= ?,
    if_there_is_myths= ?,
    
    keeper_name= ?,
    keeper_work_responsibility= ?,
    heritage_informant_name= ?,
    gender= ?,
    age= ?,
    work_responsibility= ?,
    other_information= ?,
    name_of_data_collector= ?,
    name_of_organization= ?,
    role= ?,
    
    position= ?,
    registration_date_of_heritage= ?

WHERE id = ?`,
    [
      username_of_data_collector,
      heritage_name,
      local_name,
      class_of_heritage,
      region,
      zone,
      wereda,
      tabia,
      kushet,
      unique_name_place,

      previous_service,
      current_service,
      Given_ID,
      heritage_owner,
      other_owner,
      gps,
      east,
      _north,
      _above_sea_level,
      name_of_heritage_owner,

      name_who_find_the_heritage,
      date_of_creation,
      way_of_knowing_heritage_age,
      current_status_of_the_heritage,
      height,
      length,
      breadth,
      area,
      diameter,
      shape,
      number_of_gates,
      number_of_windows,
      number_of_classes,
      made_from,
      short_description_of_heritage,
      history,
      culture,
      art,
      hand_craft,
      science,
      other_uniqueness_of_heritage,
      significance_of_heritage,
      status_of_the_heritage,
      if_destructed_description_of_heritage_destruction,
      condition_of_heritage_destruction,
      description_condition_of_heritage_destruction,
      maintenance,
      reason_of_maintenance,
      maintained_by,
      maintained_on,
      number_of_maintenance,
      evaluation_on_maintenance,
      starting_date_of_since_administered_by_current_owner,
      evaluation_answer_description,
      accessibility_of_heritage,
      description_Of_Accessibility_Heritage,
      types_evidences,
      if_other_type_evidence,
      myth,
      if_there_is_myths,
      keeper_name,
      keeper_work_responsibility,
      heritage_informant_name,
      gender,
      age,
      work_responsibility,
      other_information,
      name_of_data_collector,
      name_of_organization,
      role,
      position,
      registration_date_of_heritage,
      id,
    ],
    (error, results, fields) => {
      if (error) {
        console.error(error);
        res.status(500).send("Error updating heritage information");
      } else {
        res.json({ message: "Heritage information updated successfully" });
      }
    }
  );
});

// 22.View Each Movable Data in Table Format
// app.get("/getMovableDataa", (req, res) => {
//   const id = req.query.id; // Use id instead of username
//   const query = `SELECT * FROM movable_data WHERE id='${id}'`;

//   connection.query(query, (err, results) => {
//     if (err) {
//       console.error("Error retrieving data:", err);
//       res.status(500).json({ error: "Error retrieving data" });
//       return;
//     }
//     res.json(results);
//   });
// });

app.get("/getMovableDataa", (req, res) => {
  const id = req.query.id; // Use id instead of username
  const query = `SELECT * FROM movable_data WHERE id='${id}'`;

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error retrieving data:", err);
      res.status(500).json({ error: "Error retrieving data" });
      return;
    }
    const data = results.map((result) => ({
      "ስም ብትግርኛ": result.heritage_name,
      "ፍሉይ ናይ ከባቢ መፀወዒ (እንተሃልይዎ)": result.local_name,
      ምድብ: result.class_of_heritage,
      ክልል: result.region,
      ዞባ: result.zone,
      ወረዳ: result.wereda,
      ጣብያ: result.tabia,
      ቁሸት: result.kushet,
      "ፍሉይ ሽም ቦታ": result.unique_name_place,
      "ኣገልግሎት ናይ ቕድሚ ሐዚ": result.previous_service,
      "ኣገልግሎት ናይ ሐዚ (ዝተቐየረ እንተኾይኑ)": result.current_service,

      "መፍለይ ቑፅሪ": result.Given_ID,
      "በዓል ዋና እቲ ሓድጊ": result.heritage_owner,
      "ካልእ በዓል ዋና እቲ ሓድጊ": result.other_owner,
      "ናይ እቲ ሓድጊ በዓል ዋና ወይ ትካል ሽም": result.name_of_heritage_owner,
      "እቲ ሓድጊ ዝርከበሉ ቀዋሚ ቦታ": result.place_of_the_heritage,
      "ሓድጊ ዝርከበሉ ቀዋሚ ካልእ ቦታ": result.other_place,
      "ነቲ ሓድጊ ዘስረሐ፣ ዝሰርሐ፣ ወይ ድማ ዝረኸበ ውልቀ-ሰብ ወይ ኣካል ሽም":
        result.name_who_find_the_heritage,
      "እቲ ሓድጊ ዝተሰርሐሉ ጊዜ/ዘመን": moment(result.date_of_creation).format(
        "DD-MM-YYYY"
      ),
      "ዕድመ እቲ ሓድጊ ዝተነፀረሉ (ዝተፈለጠሉ) መንገዲ": result.way_of_knowing_heritage_age,
      "እቲ ሓድጊ ዝተረኸበሉ ኩነታት": result.way_of_heritage_finding,
      "ህልው ኩነታት እቲ ሓድጊ (ኩነታታት ጉድኣት፣ ወይ ዝኮነ ለውጥታት ዘለዎ እንተኮይኑ፣ ወይ ከምዝነበሮ ድዩ ዘሎ፣ ወዘተ ዝበል) ":
        result.current_status_of_the_heritage,
      "ቁመት(ሜ)": result.height,
      "ንውሓት (ሜ)": result.length,
      "ወርዲ (ሜ)": result.breadth,
      "ስፍሓት (ሜ )": result.area,
      "ዲያሜትር (ሜ)": result.diameter,
      ርጉዲ: result.thickness,
      ቅርፂ: result.shape,
      ሕብሪ: result.color,
      "በዝሒ ገፅ (ዘለዎ እንተኮይኑ)": result.number_of_pages,
      "በዝሒ ቃላት (ዘለዎ እንተኮይኑ)": result.number_of_words,
      "በዝሒ ሓረጋት (ዘለዎ እንተኮይኑ)": result.number_of_phrases,
      "በዝሒ ስእልታት (ዘለዎ እንተኮይኑ)": result.number_of_pictures,
      "በዝሒ ዓምድታት ( ንመፅሓፍ ኮይኑ ዘለዎ እንተኮይኑ)": result.number_pillars,
      "መማላኸዒ ኣለዎ ዶ?": result.decoration,
      "መማላኸዒ እንተሃልይዎ ዝርዝሩ": result.has_decoration,
      "ዝተሰርሐሉ ኣቕሓ (ካብ ምንታይ ዝተሰርሐ እዩ)": result.made_from,
      "ካልእ ዝተሰርሐሉ ኣቕሓ": result.made_from_other,
      "ሓፂር መረዳእታ/መብራህረሂ እቲ ሓድጊ": result.short_description_of_heritage,
      "እቲ ሓድጊ ፍሉይን ተደናቕን ዝገብሮ ": result.uniqueness_of_heritage,
      "ካልእ ነቲ ሓድጊ ፍሉይን ተደናቕን ዝገብሮ": result.other_uniqueness_of_heritage,
      "ረብሓ እቲ ሓድጊ (Significance )  ": result.significance_of_heritage,
      "እቲ ሓድጊ ሐዚ ዘለዎ ኩነታት": result.status_of_the_heritage,
      "ኩነታት ጉድኣት እንትግለፅ":
        result.if_destructed_description_of_heritage_destruction,
      "ኩነታት ሓደጋ/ስግኣት ኣብቲ ሓድጊ": result.condition_of_heritage_destruction,
      "ኩነታት ሓደጋ/ስግኣት ኣብቲ ሓድጊ እንተሃልዩ":
        result.description_condition_of_heritage_destruction,
      "ቅድሚ ሐዚ ዝተገበረሉ ናይ ዕቀባን ፅገና ስራሕ": result.maintenance,
      "ምክንያት ፅገናኡ": result.reason_of_maintenance,
      "ዝፀገኖ ኣካል (ነቲ ፅገና ዘካየደ ኣካል)": result.maintained_by,
      "ፅገና ዝተካየደሉ እዋን": moment(result.maintained_on).format("DD-MM-YYYY"),

      "ፅገና ዝተካየደሉ በዝሒ ጊዜ (ሓንቲ ጊዜ፣ ክልተ ጊዜ፣ ሰለስተ ጊዜ፣ ብዙሕ ጊዜ..) ":
        result.number_of_maintenance,
      "ግምገማ እቲ ዝተገበረ ናይ ፅገና/ምዕቃብ ስራሕ ከመይ ኔሩ ?":
        result.evaluation_on_maintenance,
      "ናይ ሕድሕድ መልሲ ብእኩልን ብቑዕን ምክንያት ": result.evaluation_answer_description,
      "እቲ ሓድጊ በቲ ናይ ሐዚ ብበዓል ዋና ምምሕዳር ዝጀመረሉ እዋን": moment(
        result.starting_date_of_since_administered_by_current_owner
      ).format("DD-MM-YYYY"),
      "ተበፃሓይነት እቲ ሓድጊ": result.accessibility_of_heritage,
      "ሕድሕድ መልሲ ብእኩልን ብቑዕን ምክንያት እንትግለፅ)":
        result.description_Of_Accessibility_Heritage,
      "ተዛመድቲ መረዳእታታት እቲ ሓድጊ (ዘለውዎ እንተኮይኖም)": result.types_evidences,
      "ካልእ ብፍሉይ ዝተጠቐሱ": result.if_other_type_evidence,
      "ሽም መረዳእታ ወሃቢ ኣካል": result.heritage_informant_name,
      ፆታ: result.gender,
      ዕድመ: result.age,

      "ስራሕ ሓላፍነት": result.work_responsibility,
      ካልእ: result.other_information,

      "ሽም ናይ መዝጋቢ መረዳእታ": result.name_of_data_collector,
      "ሽም ዝስርሐሉ ትካል": result.name_of_organization,
      "መደብ ስራሕ": result.position,
      ሓላፍነት: result.role,
      ፌርማ: result.signature,

      "እቲ ሓድጊ ዝተመዝገበሉ መዓልቲ": moment(
        result.registration_date_of_heritage
      ).format("DD-MM-YYYY"),
    }));
    res.json(data);
  });
});

// // 22.View Each Non Movable Data in Table Format
// app.get("/getnonMovableDataa", (req, res) => {
//   const id = req.query.id; // Use id instead of username
//   const query = `SELECT * FROM non_movable_heritage_data WHERE id='${id}'`;

//   connection.query(query, (err, results) => {
//     if (err) {
//       console.error("Error retrieving data:", err);
//       res.status(500).json({ error: "Error retrieving data" });
//       return;
//     }

//     res.json(results);
//   });
// });

app.get("/getnonMovableDataa", (req, res) => {
  const id = req.query.id; // Use id instead of username
  const query = `SELECT * FROM non_movable_heritage_data WHERE id='${id}'`;

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error retrieving data:", err);
      res.status(500).json({ error: "Error retrieving data" });
      return;
    }
    const data = results.map((result) => ({
      "ስም ብትግርኛ": result.heritage_name,
      "ፍሉይ ናይ ከባቢ መፀወዒ (እንተሃልይዎ)": result.local_name,
      ምድብ: result.class_of_heritage,
      ክልል: result.region,
      ዞባ: result.zone,
      ወረዳ: result.wereda,
      ጣብያ: result.tabia,
      ቁሸት: result.kushet,
      "ፍሉይ ሽም ቦታ": result.unique_name_place,
      "ኣገልግሎት ናይ ቕድሚ ሐዚ": result.previous_service,
      "ኣገልግሎት ናይ ሐዚ (ዝተቐየረ እንተኾይኑ)": result.current_service,

      "መፍለይ ቑፅሪ": result.Given_ID,
      "በዓል ዋና እቲ ሓድጊ": result.heritage_owner,
      "ካልእ በዓል ዋና እቲ ሓድጊ": result.other_owner,
      "ጂ.ፒ.ኤስ": result.gps,
      ምብራቕ: result.east,
      ሰሜን: result._north,
      "ብራኸ ልዕሊ ፀፍሒ ባሕሪ (ብሜትር)": result._above_sea_level,
      "ናይ እቲ ሓድጊ በዓል ዋና ወይ ትካል ሽም": result.name_of_heritage_owner,
      "እቲ ሓድጊ ዝርከበሉ ቀዋሚ ቦታ": result.place_of_the_heritage,
      "ሓድጊ ዝርከበሉ ቀዋሚ ካልእ ቦታ": result.other_place,
      "ነቲ ሓድጊ ዘስረሐ፣ ዝሰርሐ፣ ወይ ድማ ዝረኸበ ውልቀ-ሰብ ወይ ኣካል ሽም":
        result.name_who_find_the_heritage,
      "እቲ ሓድጊ ዝተሰርሐሉ ጊዜ/ዘመን": moment(result.date_of_creation).format(
        "DD-MM-YYYY"
      ),
      "ዕድመ እቲ ሓድጊ ዝተነፀረሉ (ዝተፈለጠሉ) መንገዲ": result.way_of_knowing_heritage_age,
      "እቲ ሓድጊ ዝተረኸበሉ ኩነታት": result.way_of_heritage_finding,
      "ህልው ኩነታት እቲ ሓድጊ (ኩነታታት ጉድኣት፣ ወይ ዝኮነ ለውጥታት ዘለዎ እንተኮይኑ፣ ወይ ከምዝነበሮ ድዩ ዘሎ፣ ወዘተ ዝበል) ":
        result.current_status_of_the_heritage,

      "ቁመት(ሜ)": result.height,
      "ንውሓት (ሜ)": result.length,
      "ወርዲ (ሜ)": result.breadth,
      "ስፍሓት (ሜ )": result.area,
      "ዲያሜትር (ሜ)": result.diameter,
      ቅርፂ: result.shape,
      "በዝሒ መእተዊ በሪ (ዘለዎ እንተኮይኑ)": result.number_of_gates,
      "በዝሒ መሳኹቲ (ዘለዎ እንተኮይኑ)": result.number_of_windows,
      "በዝሒ ክፍልታት (ዘለዎ እንተኮይኑ)": result.number_of_classes,

      "ዝተሰርሐሉ ኣቕሓ (ካብ ምንታይ ዝተሰርሐ እዩ)": result.made_from,

      "ሓፂር መረዳእታ/መብራህረሂ እቲ ሓድጊ": result.short_description_of_heritage,
      "ፍሉይነት እቲ ሓድጊ ብኣንፃር ታሪኽ": result.history,
      "ፍሉይነት እቲ ሓድጊ ብኣንፃር ባህሊ": result.culture,
      "ፍሉይነት እቲ ሓድጊ ብኣንፃር ስነ-ጥበብ": result.art,
      "ፍሉይነት እቲ ሓድጊ ብኣንፃር ኢደ-ጥበብ": result.hand_craft,
      "ፍሉይነት እቲ ሓድጊ ብኣንፃር ሳይንስ": result.science,

      "ካልእ ነቲ ሓድጊ ፍሉይን ተደናቕን ዝገብሮ": result.other_uniqueness_of_heritage,
      "ረብሓ እቲ ሓድጊ (Significance )  ": result.significance_of_heritage,
      "እቲ ሓድጊ ሐዚ ዘለዎ ኩነታት": result.status_of_the_heritage,

      "ኩነታት ጉድኣት እንትግለፅ":
        result.if_destructed_description_of_heritage_destruction,
      "ኩነታት ሓደጋ/ስግኣት ኣብቲ ሓድጊ": result.condition_of_heritage_destruction,
      "ኩነታት ሓደጋ/ስግኣት ኣብቲ ሓድጊ እንተሃልዩ":
        result.description_condition_of_heritage_destruction,
      "ቅድሚ ሐዚ ዝተገበረሉ ናይ ዕቀባን ፅገና ስራሕ": result.maintenance,
      "ምክንያት ፅገናኡ": result.reason_of_maintenance,
      "ዝፀገኖ ኣካል (ነቲ ፅገና ዘካየደ ኣካል)": result.maintained_by,
      "ፅገና ዝተካየደሉ እዋን": moment(result.maintained_on).format("DD-MM-YYYY"),

      "ፅገና ዝተካየደሉ በዝሒ ጊዜ (ሓንቲ ጊዜ፣ ክልተ ጊዜ፣ ሰለስተ ጊዜ፣ ብዙሕ ጊዜ..) ":
        result.number_of_maintenance,
      "ግምገማ እቲ ዝተገበረ ናይ ፅገና/ምዕቃብ ስራሕ ከመይ ኔሩ ?":
        result.evaluation_on_maintenance,
      "ናይ ሕድሕድ መልሲ ብእኩልን ብቑዕን ምክንያት ": result.evaluation_answer_description,
      "እቲ ሓድጊ በቲ ናይ ሐዚ ብበዓል ዋና ምምሕዳር ዝጀመረሉ እዋን": moment(
        result.starting_date_of_since_administered_by_current_owner
      ).format("DD-MM-YYYY"),
      "ተበፃሓይነት እቲ ሓድጊ": result.accessibility_of_heritage,
      "ሕድሕድ መልሲ ብእኩልን ብቑዕን ምክንያት እንትግለፅ)":
        result.description_Of_Accessibility_Heritage,
      "ተዛመድቲ መረዳእታታት እቲ ሓድጊ (ዘለውዎ እንተኮይኖም)": result.types_evidences,
      "ካልእ ብፍሉይ ዝተጠቐሱ": result.if_other_type_evidence,

      "መረዳእታ አፈ ታሪክ ናይቲ ሓድጊ ወይ ሓድጊ ቦታ": result.myth,
      "ዘለዎ እንተኮይኑ እቲ ኣፈ-ታሪክ ብሓፂሩ ኣብዚ እንትግለፅ   ": result.if_there_is_myths,
      "ሽም ሓላዊ እቲ ሓድጊ": result.keeper_name,
      "ስራሕ ሓላፍነት": result.keeper_work_responsibility,

      "ሽም መረዳእታ ወሃቢ ኣካል": result.heritage_informant_name,
      ፆታ: result.gender,
      ዕድመ: result.age,

      "ስራሕ ሓላፍነት": result.work_responsibility,
      ካልእ: result.other_information,

      "ሽም ናይ መዝጋቢ መረዳእታ": result.name_of_data_collector,
      "ሽም ዝስርሐሉ ትካል": result.name_of_organization,
      "መደብ ስራሕ": result.position,
      ሓላፍነት: result.role,

      "እቲ ሓድጊ ዝተመዝገበሉ መዓልቲ": moment(
        result.registration_date_of_heritage
      ).format("DD-MM-YYYY"),
    }));
    res.json(data);
  });
});

//23. Retrieve heritage names and id for Movable Data
app.get("/movableData", (req, res) => {
  const username = req.query.username;
  const query = `SELECT * FROM movable_data WHERE 	username_of_data_collector='${username}'`;
  connection.query(query, (err, results) => {
    if (err) {
      console.error(
        "Error retrieving data:",

        err
      );
      res.status(500).json({ error: "Error retrieving data" });
      return;
    }
    res.json(results);
  });
});

// 23.1 to get for core admin as movable datas

//23. Retrieve heritage names and id for Movable Data
app.get("/movableDataCoreAdmin", (req, res) => {
  const username = req.query.username;
  const query = `SELECT * FROM movable_data`;
  connection.query(query, (err, results) => {
    if (err) {
      console.error(
        "Error retrieving data:",

        err
      );
      res.status(500).json({ error: "Error retrieving data" });
      return;
    }
    res.json(results);
  });
});
// 24.View My Profile/Core Admin,Data Collector and  Data Collector
app.get("/get-profile", (req, res) => {
  const username = req.query.username;
  connection.query(
    `SELECT username,password, first_name, last_name, gender, email, phone_number, position, role 
    FROM user WHERE username = '${username}'`,
    (err, results) => {
      if (err) {
        console.error("Error retrieving data from database:", err);
        res.status(500).send({ message: "Error retrieving data" });
      } else {
        if (results.length === 0) {
          res.status(404).send({ message: "Username not found" });
        } else {
          res.setHeader("Content-Type", "application/json");
          res.json({
            data: {
              username: results[0].username,
              password: results[0].password,
              firstName: results[0].first_name,
              lastName: results[0].last_name,
              gender: results[0].gender,
              email: results[0].email,
              phoneNumber: results[0].phone_number,
              position: results[0].position,
              role: results[0].role,
            },
          });
        }
      }
    }
  );
});

//25. Retrieve Heritage name and id of non movable data
app.get("/gettingNonMovableData", (req, res) => {
  const username = req.query.username;
  const query = `SELECT * FROM non_movable_heritage_data WHERE 	username_of_data_collector='${username}'`;
  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error retrieving data:", err);
      res.status(500).json({ error: "Error retrieving data" });
      return;
    }
    res.json(results);
  });
});

// 25.1  core admin non movable

//25. Retrieve Heritage name and id of non movable data
app.get("/gettNonMovableData", (req, res) => {
  const username = req.query.username;
  const query = `SELECT * FROM non_movable_heritage_data`;
  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error retrieving data:", err);
      res.status(500).json({ error: "Error retrieving data" });
      return;
    }
    res.json(results);
  });
});
app.post("/confirm", (req, res) => {
  const id = req.body.id;
  connection.query(
    `UPDATE movable_data SET confirmed = 1 WHERE id = ?`,
    [id],
    (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).send({ message: "Error confirming data" });
      } else {
        res.json({ message: "Data confirmed successfully" });
      }
    }
  );
});

// API to get confirmed status of movable data
app.get("/confirmed/:id", (req, res) => {
  const id = req.params.id;
  connection.query(
    `SELECT * FROM movable_data WHERE id = ?`,
    [id],
    (err, results) => {
      if (err) {
        console.error(err);
        res.status(404).send({ message: "Data not found" });
      } else {
        const result = results[0];
        if (result.confirmed) {
          res.json({ confirmed: true });
        } else {
          res.json({ confirmed: false });
        }
      }
    }
  );
});
app.put("/api/sendMessage", (req, res) => {
  const { id, message } = req.body;

  connection.query(
    `UPDATE movable_data SET Message_From_Admin = ? WHERE id = ?`,
    [message, id],
    (error, results) => {
      if (error) {
        console.error(error);
        res.status(500).send({ message: "Failed to update record" });
      } else {
        res.send({ message: "Record updated successfully" });
      }
    }
  );
});

// app.post(
//   "/test",
//   uploadMiddleware.fields([{ name: "imageOfHeritage", maxCount: null }]),
//   function (req, res) {
//     // Handle the uploaded files for 'imageOfHeritage' key
//     console.log("Received request at /users endpoint");

//     console.log("Received data from the frontend:", req.body);
//     //   const dob = new Date(dateOfBirth);

//     // Get the image file paths
//     let imagePaths = req.files.imageOfHeritage.map((file) => file.path);
//     imagePaths = imagePaths.join(",");

//     // Insert the user into the database
//     // Insert the data into the database
//     const sql = `
//   INSERT INTO image
//   (
//      path
//       )
//   VALUES (?)`;

//     connection.query(sql, [imagePaths], function (err, result) {
//       if (err) {
//         console.error("Error registering user: ", err);
//         res.status(500).send("Error registering user");
//       } else {
//         console.log("User registered successfully");
//         res.sendStatus(201);
//       }
//     });
//   }
// );
const path = require("path"); // Add this line

// app.get("/image/:id", (req, res) => {
//   const id = req.params.id;
//   const query = `SELECT path FROM image WHERE id = ${id}`;
//   connection.query(query, (err, rows) => {
//     if (err) {
//       console.error("error fetching image:", err);
//       res.status(500).send({ message: "Error fetching image" });
//     } else {
//       const filePath = path.join(__dirname, rows[0].path); // Get the absolute path
//       res.set("Content-Type", "image/jpeg");
//       res.sendFile(filePath); // Send the file
//     }
//   });
// });

// app.get("/image/:id", (req, res) => {
//   const id = req.params.id;
//   const query = `SELECT path FROM image WHERE id = ${id}`;
//   connection.query(query, (err, rows) => {
//     if (err) {
//       console.error("error fetching image:", err);
//       res.status(500).send({ message: "Error fetching image" });
//     } else if (rows.length === 0) {
//       res.status(404).send({ message: "Image not found" });
//     } else {
//       const filePaths = rows[0].path.split(","); // Split the path into an array
//       filePaths.forEach((filePath) => {
//         const filePathAbsolutePath = path.join(__dirname, filePath.trim()); // Join the directory name with the relative path
//         if (!fs.existsSync(filePathAbsolutePath)) {
//           // Check if file exists
//           res.status(404).send({ message: "File not found" });
//         } else {
//           const mimeType = mime.getType(filePathAbsolutePath); // Get file type
//           if (!mimeType || mimeType !== "image/jpeg") {
//             // Check file type
//             res.status(400).send({ message: "Invalid file type" });
//           } else {
//             res.set("Content-Type", mimeType);
//             res.sendFile(filePathAbsolutePath); // Send the file
//           }
//         }
//       });
//     }
//   });
// });

// app.post("/update", upload.array("imageOfHeritage", 10), (req, res) => {
//   const existingImagePaths = req.body.existingImagePaths || [];
//   const newImagePaths = req.files.map((file) => file.filename);

//   // Update the existing images in the database
//   const updateQuery =
//     "UPDATE heritage_images SET image_path = ? WHERE image_path IN (?)";
//   connection.query(
//     updateQuery,
//     [newImagePaths, existingImagePaths],
//     (err, result) => {
//       if (err) {
//         console.error("Error updating images:", err);
//         return res.status(500).json({ error: "Error updating images" });
//       }

//       // Insert new images into the database
//       const insertQuery = "INSERT INTO heritage_images (image_path) VALUES ?";
//       const newImageValues = newImagePaths.map((path) => [path]);
//       connection.query(insertQuery, [newImageValues], (err, result) => {
//         if (err) {
//           console.error("Error inserting images:", err);
//           return res.status(500).json({ error: "Error inserting images" });
//         }

//         res.status(200).json({ message: "User data updated successfully" });
//       });
//     }
//   );
// });

// images

app.get("/api/images", (req, res) => {
  const id = req.query.id; // Retrieve the id from the query parameters

  const query = `SELECT image_of_heritage FROM movable_data WHERE id = ?`; // Use the id parameter in the query
  connection.query(query, [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error fetching image paths");
    }

    if (result.length > 0) {
      const imagePaths = result[0].image_of_heritage;
      res.json({ imagePaths: imagePaths.split(",") });
    } else {
      res.status(404).send("No image paths found for the given ID");
    }
  });
});

app.get("/api/images/:filename", (req, res) => {
  const filename = req.params.filename;
  const imagePath = path.join(__dirname, "uploads", filename);

  fs.exists(imagePath, (exists) => {
    if (!exists) {
      return res.status(404).send("Image not found");
    }
    res.sendFile(imagePath);
  });
});
// New endpoint to delete an image
app.delete("/api/images/:filename", (req, res) => {
  const filename = req.params.filename;
  const id = req.query.id; // Retrieve the id from the query parameters

  const imagePath = path.join(__dirname, "uploads", filename);
  const query = `SELECT image_of_heritage FROM movable_data WHERE id = ?`; // Use the id parameter in the query

  connection.query(query, [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error fetching image paths");
    }
    if (result.length > 0) {
      let imagePaths = result[0].image_of_heritage.split(",");
      imagePaths = imagePaths.filter((image) => image !== filename);
      const updatedPaths = imagePaths.join(",");

      const updateQuery = `UPDATE movable_data SET image_of_heritage = ? WHERE id = ?`; // Use the id parameter in the update query
      connection.query(updateQuery, [updatedPaths, id], (err, updateResult) => {
        if (err) {
          console.error(err);
          return res.status(500).send("Error updating image paths");
        }

        fs.unlink(imagePath, (err) => {
          if (err) {
            console.error(err);
            return res.status(500).send("Error deleting image file");
          }
          res.sendStatus(200);
        });
      });
    } else {
      res.status(404).send("No image paths found for the given ID");
    }
  });
});

app.put(
  "/updateImage",
  uploadMiddleware.fields([{ name: "imageOfHeritage", maxCount: null }]),
  (req, res) => {
    const id = req.query.id;

    let imagePaths = req.files.imageOfHeritage.map((file) => file.filename);
    imagePaths = imagePaths.join(",");

    const sql = `
      SELECT image_of_heritage
      FROM movable_data
      WHERE id = ?
    `;

    connection.query(sql, [id], (err, result) => {
      if (err) {
        console.error("Error retrieving existing image path: ", err);
        res.status(500).send("Error updating image");
      } else {
        let existingPaths = result[0].image_of_heritage || "";
        let newPaths = existingPaths
          ? `${existingPaths},${imagePaths}`
          : imagePaths;

        const updateSql = `
          UPDATE movable_data
          SET image_of_heritage = ?
          WHERE id = ?
        `;

        connection.query(updateSql, [newPaths, id], (err, result) => {
          if (err) {
            console.error("Error updating image: ", err);
            res.status(500).send("Error updating image");
          } else {
            console.log("Image updated successfully");
            res.sendStatus(200);
          }
        });
      }
    });
  }
);

// images
app.get("/api/nonMovimages", (req, res) => {
  const id = req.query.id; // Retrieve the id from the query parameters

  const query = `SELECT image_of_heritage FROM non_movable_heritage_data WHERE id = ?`; // Use the id parameter in the query
  connection.query(query, [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error fetching image paths");
    }
    if (result.length > 0) {
      const imagePaths = result[0].image_of_heritage;
      res.json({ imagePaths: imagePaths.split(",") });
    } else {
      res.status(404).send("No image paths found for the given ID");
    }
  });
});

app.get("/api/nonMovimages/:filename", (req, res) => {
  const filename = req.params.filename;
  const imagePath = path.join(__dirname, "uploads", filename);

  fs.exists(imagePath, (exists) => {
    if (!exists) {
      return res.status(404).send("Image not found");
    }
    res.sendFile(imagePath);
  });
});
// New endpoint to delete an image
app.delete("/api/nonMovimages/:filename", (req, res) => {
  const filename = req.params.filename;
  const id = req.query.id; // Retrieve the id from the query parameters

  const imagePath = path.join(__dirname, "uploads", filename);
  const query = `SELECT image_of_heritage FROM non_movable_heritage_data WHERE id = ?`; // Use the id parameter in the query

  connection.query(query, [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error fetching image paths");
    }
    if (result.length > 0) {
      let imagePaths = result[0].image_of_heritage.split(",");
      imagePaths = imagePaths.filter((image) => image !== filename);
      const updatedPaths = imagePaths.join(",");

      const updateQuery = `UPDATE non_movable_heritage_data SET image_of_heritage = ? WHERE id = ?`; // Use the id parameter in the update query
      connection.query(updateQuery, [updatedPaths, id], (err, updateResult) => {
        if (err) {
          console.error(err);
          return res.status(500).send("Error updating image paths");
        }

        fs.unlink(imagePath, (err) => {
          if (err) {
            console.error(err);
            return res.status(500).send("Error deleting image file");
          }
          res.sendStatus(200);
        });
      });
    } else {
      res.status(404).send("No image paths found for the given ID");
    }
  });
});

app.put(
  "/nonMovupdateImage",
  uploadMiddleware.fields([{ name: "imageOfHeritage", maxCount: null }]),
  (req, res) => {
    const id = req.query.id;

    let imagePaths = req.files.imageOfHeritage.map((file) => file.filename);
    imagePaths = imagePaths.join(",");

    const sql = `
      SELECT image_of_heritage
      FROM non_movable_heritage_data
      WHERE id = ?
    `;

    connection.query(sql, [id], (err, result) => {
      if (err) {
        console.error("Error retrieving existing image path: ", err);
        res.status(500).send("Error updating image");
      } else {
        let existingPaths = result[0].image_of_heritage || "";
        let newPaths = existingPaths
          ? `${existingPaths},${imagePaths}`
          : imagePaths;

        const updateSql = `
          UPDATE non_movable_heritage_data
          SET image_of_heritage = ?
          WHERE id = ?
        `;

        connection.query(updateSql, [newPaths, id], (err, result) => {
          if (err) {
            console.error("Error updating image: ", err);
            res.status(500).send("Error updating image");
          } else {
            console.log("Image updated successfully");
            res.sendStatus(200);
          }
        });
      }
    });
  }
);

//signature images for non movable heritages
app.get("/api/imagesNonMovSignature", (req, res) => {
  const id = req.query.id; // Retrieve the id from the query parameters

  const query = `SELECT descriptive_image_of_heritage FROM non_movable_heritage_data WHERE id = ?`; // Use the id parameter in the query
  connection.query(query, [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error fetching image paths");
    }
    if (result.length > 0) {
      const imagePaths = result[0].descriptive_image_of_heritage;
      res.json({ imagePaths: imagePaths.split(",") });
    } else {
      res.status(404).send("No image paths found for the given ID");
    }
  });
});

// New endpoint to delete an image
app.delete("/api/imagesNonMovSignature/:filename", (req, res) => {
  const filename = req.params.filename;
  const id = req.query.id; // Retrieve the id from the query parameters

  const imagePath = path.join(__dirname, "uploads", filename);
  const query = `SELECT descriptive_image_of_heritage FROM non_movable_heritage_data WHERE id = ?`; // Use the id parameter in the query

  connection.query(query, [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error fetching image paths");
    }
    if (result.length > 0) {
      let imagePaths = result[0].descriptive_image_of_heritage.split(",");
      imagePaths = imagePaths.filter((image) => image !== filename);
      const updatedPaths = imagePaths.join(",");

      const updateQuery = `UPDATE non_movable_heritage_data SET descriptive_image_of_heritage = ? WHERE id = ?`; // Use the id parameter in the update query
      connection.query(updateQuery, [updatedPaths, id], (err, updateResult) => {
        if (err) {
          console.error(err);
          return res.status(500).send("Error updating image paths");
        }

        fs.unlink(imagePath, (err) => {
          if (err) {
            console.error(err);
            return res.status(500).send("Error deleting image file");
          }
          res.sendStatus(200);
        });
      });
    } else {
      res.status(404).send("No image paths found for the given ID");
    }
  });
});

app.put(
  "/updateImageNonMovSignature",
  uploadMiddleware.fields([{ name: "imageOfHeritage", maxCount: null }]),
  (req, res) => {
    const id = req.query.id;

    let imagePaths = req.files.imageOfHeritage.map((file) => file.filename);
    imagePaths = imagePaths.join(",");

    const sql = `
      SELECT descriptive_image_of_heritage
      FROM non_movable_heritage_data
      WHERE id = ?
    `;

    connection.query(sql, [id], (err, result) => {
      if (err) {
        console.error("Error retrieving existing image path: ", err);
        res.status(500).send("Error updating image");
      } else {
        let existingPaths = result[0].descriptive_image_of_heritage || "";
        let newPaths = existingPaths
          ? `${existingPaths},${imagePaths}`
          : imagePaths;

        const updateSql = `
          UPDATE non_movable_heritage_data
          SET descriptive_image_of_heritage = ?
          WHERE id = ?
        `;

        connection.query(updateSql, [newPaths, id], (err, result) => {
          if (err) {
            console.error("Error updating image: ", err);
            res.status(500).send("Error updating image");
          } else {
            console.log("Image updated successfully");
            res.sendStatus(200);
          }
        });
      }
    });
  }
);

// signature images for movable heritages
app.get("/api/imagesMovSignature", (req, res) => {
  const id = req.query.id; // Retrieve the id from the query parameters

  const query = `SELECT descriptive_image_of_heritage FROM movable_data WHERE id = ?`; // Use the id parameter in the query
  connection.query(query, [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error fetching image paths");
    }
    if (result.length > 0) {
      const imagePaths = result[0].descriptive_image_of_heritage;
      res.json({ imagePaths: imagePaths.split(",") });
    } else {
      res.status(404).send("No image paths found for the given ID");
    }
  });
});

// New endpoint to delete an image
app.delete("/api/imagesMovSignature/:filename", (req, res) => {
  const filename = req.params.filename;
  const id = req.query.id; // Retrieve the id from the query parameters

  const imagePath = path.join(__dirname, "uploads", filename);
  const query = `SELECT descriptive_image_of_heritage FROM movable_data WHERE id = ?`; // Use the id parameter in the query

  connection.query(query, [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error fetching image paths");
    }
    if (result.length > 0) {
      let imagePaths = result[0].descriptive_image_of_heritage.split(",");
      imagePaths = imagePaths.filter((image) => image !== filename);
      const updatedPaths = imagePaths.join(",");

      const updateQuery = `UPDATE movable_data SET descriptive_image_of_heritage = ? WHERE id = ?`; // Use the id parameter in the update query
      connection.query(updateQuery, [updatedPaths, id], (err, updateResult) => {
        if (err) {
          console.error(err);
          return res.status(500).send("Error updating image paths");
        }

        fs.unlink(imagePath, (err) => {
          if (err) {
            console.error(err);
            return res.status(500).send("Error deleting image file");
          }
          res.sendStatus(200);
        });
      });
    } else {
      res.status(404).send("No image paths found for the given ID");
    }
  });
});

app.put(
  "/updateImageMovSignature",
  uploadMiddleware.fields([{ name: "imageOfHeritage", maxCount: null }]),
  (req, res) => {
    const id = req.query.id;

    let imagePaths = req.files.imageOfHeritage.map((file) => file.filename);
    imagePaths = imagePaths.join(",");

    const sql = `
      SELECT descriptive_image_of_heritage
      FROM movable_data
      WHERE id = ?
    `;

    connection.query(sql, [id], (err, result) => {
      if (err) {
        console.error("Error retrieving existing image path: ", err);
        res.status(500).send("Error updating image");
      } else {
        let existingPaths = result[0].descriptive_image_of_heritage || "";
        let newPaths = existingPaths
          ? `${existingPaths},${imagePaths}`
          : imagePaths;

        const updateSql = `
          UPDATE movable_data
          SET descriptive_image_of_heritage = ?
          WHERE id = ?
        `;

        connection.query(updateSql, [newPaths, id], (err, result) => {
          if (err) {
            console.error("Error updating image: ", err);
            res.status(500).send("Error updating image");
          } else {
            console.log("Image updated successfully");
            res.sendStatus(200);
          }
        });
      }
    });
  }
);

// signature images for keeperat non mov  heritages
app.get("/api/imagesKeeperSignature", (req, res) => {
  const id = req.query.id; // Retrieve the id from the query parameters

  const query = `SELECT keeper_signature_image FROM non_movable_heritage_data WHERE id = ?`; // Use the id parameter in the query
  connection.query(query, [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error fetching image paths");
    }
    if (result.length > 0) {
      const imagePaths = result[0].keeper_signature_image;
      res.json({ imagePaths: imagePaths.split(",") });
    } else {
      res.status(404).send("No image paths found for the given ID");
    }
  });
});

// New endpoint to delete an image
app.delete("/api/imagesKeeperSignature/:filename", (req, res) => {
  const filename = req.params.filename;
  const id = req.query.id; // Retrieve the id from the query parameters

  const imagePath = path.join(__dirname, "uploads", filename);
  const query = `SELECT keeper_signature_image FROM non_movable_heritage_data WHERE id = ?`; // Use the id parameter in the query

  connection.query(query, [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error fetching image paths");
    }
    if (result.length > 0) {
      let imagePaths = result[0].keeper_signature_image.split(",");
      imagePaths = imagePaths.filter((image) => image !== filename);
      const updatedPaths = imagePaths.join(",");

      const updateQuery = `UPDATE non_movable_heritage_data SET keeper_signature_image = ? WHERE id = ?`; // Use the id parameter in the update query
      connection.query(updateQuery, [updatedPaths, id], (err, updateResult) => {
        if (err) {
          console.error(err);
          return res.status(500).send("Error updating image paths");
        }

        fs.unlink(imagePath, (err) => {
          if (err) {
            console.error(err);
            return res.status(500).send("Error deleting image file");
          }
          res.sendStatus(200);
        });
      });
    } else {
      res.status(404).send("No image paths found for the given ID");
    }
  });
});

app.put(
  "/updateImageKeeperSignature",
  uploadMiddleware.fields([{ name: "imageOfHeritage", maxCount: null }]),
  (req, res) => {
    const id = req.query.id;

    let imagePaths = req.files.imageOfHeritage.map((file) => file.filename);
    imagePaths = imagePaths.join(",");

    const sql = `
      SELECT keeper_signature_image
      FROM non_movable_heritage_data
      WHERE id = ?
    `;

    connection.query(sql, [id], (err, result) => {
      if (err) {
        console.error("Error retrieving existing image path: ", err);
        res.status(500).send("Error updating image");
      } else {
        let existingPaths = result[0].keeper_signature_image || "";
        let newPaths = existingPaths
          ? `${existingPaths},${imagePaths}`
          : imagePaths;

        const updateSql = `
          UPDATE non_movable_heritage_data
          SET keeper_signature_image = ?
          WHERE id = ?
        `;

        connection.query(updateSql, [newPaths, id], (err, result) => {
          if (err) {
            console.error("Error updating image: ", err);
            res.status(500).send("Error updating image");
          } else {
            console.log("Image updated successfully");
            res.sendStatus(200);
          }
        });
      }
    });
  }
);
app.put("/update-seen-data-collector/:id", (req, res) => {
  const id = req.params.id;
  connection.query(
    `UPDATE movable_data SET seen_datacollector_message = 0 WHERE id = ${id}`,
    (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).send({ message: "Error updating seen_data_collector" });
      } else {
        res.send({ message: "Seen data collector updated successfully" });
      }
    }
  );
});

app.put("/update-seen-admin_message/:id", (req, res) => {
  const id = req.params.id;
  connection.query(
    `UPDATE movable_data SET seen_adimin_message = 0 WHERE id = ${id}`,
    (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).send({ message: "Error updating seen_data_collector" });
      } else {
        res.send({ message: "Seen data collector updated successfully" });
      }
    }
  );
});

app.put("/update-unseen-data-collector/:id", (req, res) => {
  const id = req.params.id;
  connection.query(
    `UPDATE movable_data SET seen_datacollector_message = 1 WHERE id = ${id}`,
    (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).send({ message: "Error updating seen_data_collector" });
      } else {
        res.send({ message: "Seen data collector updated successfully" });
      }
    }
  );
});

app.put("/update-seen-admin/:id", (req, res) => {
  const id = req.params.id;
  const { seen_datacollector_message } = req.body;
  connection.query(
    `UPDATE movable_data SET seen_adimin_message = ? WHERE id = ?`,
    [seen_datacollector_message, id],
    (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).send({ message: "Error updating seen_data_collector" });
      } else {
        res.send({ message: "Seen data collector updated successfully" });
      }
    }
  );
});

// for non movable data

app.put("/update-seen-data-collector-non-mov/:id", (req, res) => {
  const id = req.params.id;
  connection.query(
    `UPDATE non_movable_heritage_data SET seen_datacollector_message = 0 WHERE id = ${id}`,
    (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).send({ message: "Error updating seen_data_collector" });
      } else {
        res.send({ message: "Seen data collector updated successfully" });
      }
    }
  );
});

app.put("/update-seen-admin_message-non-mov/:id", (req, res) => {
  const id = req.params.id;
  connection.query(
    `UPDATE non_movable_heritage_data SET seen_adimin_message = 0 WHERE id = ${id}`,
    (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).send({ message: "Error updating seen_data_collector" });
      } else {
        res.send({ message: "Seen data collector updated successfully" });
      }
    }
  );
});

app.put("/update-unseen-data-collector-non-mov/:id", (req, res) => {
  const id = req.params.id;
  connection.query(
    `UPDATE non_movable_heritage_data SET seen_datacollector_message = 1 WHERE id = ${id}`,
    (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).send({ message: "Error updating seen_data_collector" });
      } else {
        res.send({ message: "Seen data collector updated successfully" });
      }
    }
  );
});

app.put("/update-seen-admin-non-mov/:id", (req, res) => {
  const id = req.params.id;
  const { seen_datacollector_message } = req.body;
  connection.query(
    `UPDATE non_movable_heritage_data SET seen_adimin_message = ? WHERE id = ?`,
    [seen_datacollector_message, id],
    (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).send({ message: "Error updating seen_data_collector" });
      } else {
        res.send({ message: "Seen data collector updated successfully" });
      }
    }
  );
});

// app.post("/users", (req, res) => {
//   const { name, email, phone } = req.body;

//   const query = "INSERT INTO users (firstName, email, phone) VALUES (?, ?, ?)";
//   connection.query(query, [name, email, phone], (err, result) => {
//     if (err) {
//       console.error("Error saving user data: ", err);
//       res.status(500).json({ error: "Error saving user data" });
//       return;
//     }

//     res.status(200).json({ message: "User data saved successfully" });
//   });
// // });
// app.post("/users", (req, res) => {
//   const { name, email, phone } = req.body;

//   const query = "INSERT INTO users (firstName, email, phone) VALUES (?, ?, ?)";
//   connection.query(query, [name, email, phone], (err, result) => {
//     if (err) {
//       console.error("Error saving user data: ", err);
//       res.status(500).json({ error: "Error saving user data" });
//       return;
//     }

//     console.log("User data saved successfully!");
//     res.status(200).json({ message: "User data saved successfully" });
//   });
// });
app.get("/getGalleryImages", (req, res) => {
  const id = req.query.id; // Get the ID from the query string
  const query = "SELECT image_of_heritage FROM movable_data WHERE id = ?";

  connection.query(query, [id], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (results.length === 0) {
      console.log(`No data found for ID: ${id}`);
      return res.status(404).json({ error: "No data found" });
    }

    console.log("Fetched image heritage data:", results);

    // Assuming image_of_heritage contains a comma-separated list of filenames
    const imageFilenames = results[0].image_of_heritage.split(",");
    const imageUrls = imageFilenames.map((filename) => {
      return `https://repositoryformymobapp-kaleab-mezgebe.onrender.com/uploads/${filename.trim()}`; // Adjust according to your server
    });

    res.json(imageUrls);
  });
});
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/getHeritageImage", (req, res) => {
  const id = req.query.id; // Get the ID from the query string
  const query =
    "SELECT descriptive_image_of_heritage FROM movable_data WHERE id = ?";

  connection.query(query, [id], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (results.length === 0) {
      console.log(`No data found for ID: ${id}`);
      return res.status(404).json({ error: "No data found" });
    }

    console.log("Fetched image heritage data:", results);

    // Assuming image_of_heritage contains a comma-separated list of filenames
    const imageFilenames = results[0].descriptive_image_of_heritage.split(",");
    const imageHeritageUrls = imageFilenames.map((filename) => {
      return `https://repositoryformymobapp-kaleab-mezgebe.onrender.com/uploads/${filename.trim()}`; // Adjust according to your server
    });

    res.json(imageHeritageUrls);
  });
});

// Serve static files from the uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.get("/getGalleryNonMovImages", (req, res) => {
  const id = req.query.id; // Get the ID from the query string
  const query =
    "SELECT image_of_heritage FROM non_movable_heritage_data WHERE id = ?";

  connection.query(query, [id], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (results.length === 0) {
      console.log(`No data found for ID: ${id}`);
      return res.status(404).json({ error: "No data found" });
    }

    console.log("Fetched image heritage data:", results);

    // Assuming image_of_heritage contains a comma-separated list of filenames
    const imageFilenames = results[0].image_of_heritage.split(",");
    const imageUrls = imageFilenames.map((filename) => {
      return `https://repositoryformymobapp-kaleab-mezgebe.onrender.com/uploads/${filename.trim()}`; // Adjust according to your server
    });

    res.json(imageUrls);
  });
});
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/getNonMovHeritageImage", (req, res) => {
  const id = req.query.id; // Get the ID from the query string
  const query =
    "SELECT descriptive_image_of_heritage FROM non_movable_heritage_data WHERE id = ?";

  connection.query(query, [id], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (results.length === 0) {
      console.log(`No data found for ID: ${id}`);
      return res.status(404).json({ error: "No data found" });
    }

    console.log("Fetched image heritage data:", results);

    // Assuming image_of_heritage contains a comma-separated list of filenames
    const imageFilenames = results[0].descriptive_image_of_heritage.split(",");
    const imageHeritageUrls = imageFilenames.map((filename) => {
      return `https://repositoryformymobapp-kaleab-mezgebe.onrender.com/uploads/${filename.trim()}`; // Adjust according to your server
    });

    res.json(imageHeritageUrls);
  });
});

// Serve static files from the uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.post("/users", (req, res) => {
  const { name, email, phone } = req.body;
  const query = "INSERT INTO users (name, email, phone) VALUES (?, ?, ?)";
  connection.query(query, [name, email, phone], (err, result) => {
    if (err) {
      console.error("Error saving user data: ", err);
      res.status(500).json({ error: "Error saving user data" });
      return;
    }

    // Check if the data was inserted successfully
    if (result.affectedRows > 0) {
      console.log("User data saved successfully!");
      console.log("Inserted user ID:", result.insertId);
      res.status(200).json({ message: "User data saved successfully" });
    } else {
      console.error("User data was not saved successfully.");
      res.status(500).json({ error: "User data was not saved successfully" });
    }
  });
});

// Serve static files from the uploads directory
app.listen(PORT, function () {
  console.log(`Server is running on port ${PORT}`);
});
