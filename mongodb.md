MongoDB vs MySQL
=================

![MongoDB](https://docs.mongodb.com/images/mongodb-logo.png) ![MySQL](https://www.mysql.com/common/logos/logo-mysql-170x115.png)

Do you have to choose? Both are free and open-source, both are multi platform, both have great advantages.

## Table of contents

1. [**Introduction**](#introduction)
2. [**MongoDB**](#mongodb)
3. [**MySQL**](#mysql)
4. [**Which to choose?**](#which-to-choose?)
    - [An example](#an-example)
5. [**More technical info**](#more-technical-info)
    - [Intuition](#intuition)
6. [**Summary**](#summary)

### Introduction

According to a survey done by [Scalegrid](https://dev.to/scalegrid/2019-database-trends--sql-vs-nosql-top-databases-single-vs-multiple-database-use-1nma) at [DeveloperWeek](https://www.developerweek.com/) 2019, MySQL is the dominating database of choise by developers at 38.9%, closely followed by MongoDB at 24.6%. Half of their respondants use a combination of SQL and NoSQL systems in their projects. And again, the clear winner amongst combinations of database types was MySQL + MongoDB with 34.15%.

### MongoDB

MongoDB, developed by MongoDB Inc, is one of the most popular document-oriented NoSQL databases. Storing data is done by key, value pair-objects in a BSON file format, very similar to JSON. Hence all javascript is supported. Therefore MongoDB is particularly suitable for Node.js projects and allows for communication between server and webapp in a human readable format.

The schema-free implementation allows flexibility and enables easy changes in the structure of data records.

MongoDB provides auto-sharding, embedding and on-board replication which in turn provides high scalability and availability. It has great efficiency and reliability capacity for storage as well as speed demands.

### MySQL

MySQL is an open-source Relational Database Management System. It was originally built and owned by Swedish MySQL AB, acquired by Sun Microsystems 2008 which in turn was bought by Oracle 2010. Some legal transactions concerning the database engine will not be covered in this article. Even though MySQL now, from 2018, also include NoSQL Document Store, JSON table functions and more, this comparison treats MySQL as a pure RDBMS (more of this later).

MySQL stores data in rows and tables, which together builds the database, and uses Structured Query Language SQL to access and transfer the data. The concept of JOIN operations simplifies the process of correlating data from different tables. Millions of read/write queries highly affects the performance and horizontal scaling is not totally easy.

## Which to choose?

MongoDB has an active, helpful community, where it seems Oracle provides the opposite. MongoDB also wins over MySQL in coping with large, unstructured amounts of data. MongoDB, due to the absence of joins and transactions, results in a need to frequently optimize your schema, based on how the application needs to access the data.

MySQL has a high reputation for reliable data protection, high availability, and management ease. Data in MySQL is organized and conforms to a certain format. Because of the strict definition of data in tables and rows, MySQL has a limited flexibility, and development and deployment processes will be slowed down.

### An example

Storing tradingdata for a customer in a table could look like:

| id | name | email         | account | date         |
| -- | ---- | ------------- | ------- | ------------ |
| 5  | 'Doe'| 'doe@doe.com' | 200     | '2020-03-21' |

Here you are limited to types, content-length and number of columns. Data will be spread across multiple tables, hence multiple tables need to be accessed to read and write data for a project.

MongoDB with JSON could expand the info above:

```
{
    id: 5,
    name: "Doe",
    email: "doe@doe.com",
    account: 200,
    date: "2020-03-21",
    newinfo: [
        {eyecolor: "blue", lipcolor: "red"}
        ]
}
```

This (or any) info is easily stored in a collection and means that you do not have to go through schema migrations anymore. All the data for an entity is stored in a single document. Working with data as flexible JSON documents in MongoDB has accelerated development cycles by 4 to 5 times. You do have to think about data consistency, though.

MongoDB uses un-Structured Query Language for communication with the document whilst MySQL uses Structured Query Language SQL for database communication.

| MySQL | MongoDB |
| ----- | ------- |
| <code>INSERT INTO trade (<br />id, name, email, account, date<br />)<br />VALUES (5, 'Doe', 'doe@doe.com',<br />200, '2020-03-21');</code> | <code>db.trade.insert({<br />id: 5,<br />name: 'Doe',<br />account: 200,<br />date: '2020-03-21'});</code> |
| <code>UPDATE trade<br />SET account = 500<br />WHERE id = 5</code> | <code>db.trade.update(<br />{id: 5},<br />{ $set: {account: 500}});</code> |

## More technical info

MySQL supports atomic transactions which means that.you can have several operations within a transaction. MongoDB 4.0 has added support for multi-document transactions making it a powerful open source database in the unstructured space.

With MySQL once a transaction is complete, the data remains consistent and stable on the disc. This makes it quite suitable for applications which can't bear data loss, though horizontal scalability can be an issue (dividing the dataset and load over multiple additional servers). 'MySQL Cluster' is a new distributed database contribution.

MongoDB's sharding has the ability to break up a collection into subsets of data to store them across multiple shards. This allows the application to grow beyond the resource limits of a standalone server or replica set. It also empowers users with automated redundancy.

Both systems allow full-text searching.

MongoDB much faster. Better if the project is big because of sharding. Better for cloudbased applications.

MySQL is good for high performance on a limited budget. It involves easy and low-maintenance setup. It supports JOIN, atomic transactions  with privilege and password security system. The main issue with MySQL is scalability.

### Intuition

MySQL now has JSON support but developers are still tied up with multiple layers of SQL functionality to interact with the JSON data. MongoDB drivers, on the other hand, and the APIs are native to the programming language of the developer.

Summary
-------

Where MongoDB has been selected over MySQL, there have been radical improvements in productivity, performance and scalability. But you cannot drop-in MongoDB as a replacement for legacy applications built around the relational data model and SQL. Organizations that have stable robust applications running on MySql will continue to do so.
