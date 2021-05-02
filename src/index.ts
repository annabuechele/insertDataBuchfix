require("dotenv").config();

type UserType = {
  id?: number;
  username: string;
  email: string;
  password: string;
  salt: string;
  name: {
    firstName: string;
    lastName: string;
  };
  location: {
    street: string;
    number: string;
    zipCode: string;
    city: string;
    state: string;
    country: string;
  };
} | null;

type BookType = {} | null;

const admins: Array<UserType> = require("./data/admins.json");
const users: Array<UserType> = require("./data/users.json");
const books: Array<BookType> = require("./data/books.json");

const sql = require("./helpers/sql_connector");

console.log(admins.length, "Admin-Users read from File");
console.log(books.length, "Books read from File");
console.log(users.length, "Users read from File");

const DropAll = async () => {
  await sql.query("SET FOREIGN_KEY_CHECKS = 0 ", () => {});
  await sql.query("TRUNCATE TABLE user", () => {
    console.log("Truncated User Table");
  });
  await sql.query("TRUNCATE TABLE book", () => {
    console.log("Truncated Book Table");
  });
  await sql.query("TRUNCATE TABLE name", () => {
    console.log("Truncated Name Table");
  });
  await sql.query("TRUNCATE TABLE address", () => {
    console.log("Truncated Address Table");
  });
  await sql.query("TRUNCATE TABLE genre", () => {
    console.log("Truncated Genre Table");
  });
  await sql.query("TRUNCATE TABLE file", () => {
    console.log("Truncated file Table");
  });
  await sql.query("TRUNCATE TABLE format", () => {
    console.log("Truncated format Table");
  });
  await sql.query("TRUNCATE TABLE user_donates_book", () => {
    console.log("Truncated User_Donates_Book Table");
  });
  await sql.query("TRUNCATE TABLE user_rents_book", () => {
    console.log("Truncated User_Rents_book Table");
  });
  await sql.query("SET FOREIGN_KEY_CHECKS = 1 ", () => {});
};

const InsertAllUsers = (isAdmin, list) => {
  list.forEach(async (user: UserType, i) => {
    let fk_address: number;
    let fk_name: number;

    //insert adress
    const locationSQL =
      "INSERT INTO address (street, number, zip, city, state, country) VALUES (?, ?, ?, ?, ?, ?)";
    await sql.query(
      locationSQL,
      [
        user.location.street,
        user.location.number,
        user.location.zipCode,
        user.location.city,
        user.location.state,
        user.location.country,
      ],
      async (locationErr, locationResults: any, locationFields) => {
        if (locationErr) throw new Error(locationErr.message);

        fk_address = locationResults.insertId;

        //name insert
        const nameSQL = "INSERT INTO name (firstname, lastname) VALUES (?, ?)";
        sql.query(
          nameSQL,
          [user.name.firstName, user.name.lastName],
          async (nameErr, nameResults: any, nameFields) => {
            if (nameErr) throw new Error(nameErr.message);

            fk_name = nameResults.insertId;
            const salt = await require("crypto")
              .randomBytes(16)
              .toString("hex");

            //user insert
            const userSQL =
              "INSERT INTO user (username, password, email, salt, is_admin, fk_name, fk_address) VALUES (?, Password(?), ?, ?, ?, ?, ?)";
            sql.query(
              userSQL,
              [
                user.username,
                user.password + salt,
                user.email,
                salt,
                isAdmin,
                fk_name,
                fk_address,
              ],
              async (userErr, userResults: any, userFields) => {
                if (userErr) throw new Error(userErr.message);
                if (isAdmin)
                  console.log(
                    1 + i + ". Admin Inserted. Username:",
                    user.username
                  );
                else
                  console.log(
                    1 + i + ". User Inserted. Username:",
                    user.username
                  );
              }
            );
          }
        );
      }
    );
  });
};

const Insert = async () => {
  await DropAll();

  await InsertAllUsers(1, admins);

  await InsertAllUsers(0, users);
};

Insert();
