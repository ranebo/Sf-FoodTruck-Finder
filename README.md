SF Food Truck Finder
====================

## Table of Contents
1. [Introduction](#introduction)
2. [Usage](#usage)
3. [Development](#development)
  - [Requirements](#requirements)
  - [Installing Dependencies](#installing-dependencies)
  - [Development Sever](#development-server)
  - [Testing](#testing)
  - [Application Architecture](#application-architecture)
4. [For KQED](#for-kqed)


## Introduction

Food Trucks and other Street Food venders have exploded in popularity in the San Francsico Bay Area. (Check out: https://offthegrid.com/)
There is most likely one right around the corner, but (up until now)
there has been no easy way to browse SF Food Trucks or find the ones nearest you.
SF Food Truck Finder allows you to search for a particular Food Truck, find the ones near you,
or peruse the map and see what's out there!

## Usage

Go to (URL HERE) to see it in action!

## Development

### Requirements
- Node 5.x

### Installing Dependencies
Run `npm install` from the root directory.

### Development Server

Simply run `npm start` to fire up the express server and Webpack middleware which serves a live, hot-reloading version of the application.

### Testing
Run the test Mocha-Chai suite with `npm test`


### Application Architecture ###

```
                 Front-End
                +------------------+
                |                  |
                |                  |
                |     React.JS     |
                |                  |
                |                  |
                +--------A-+-------+
                         | |
                         | |
                         | |
                Back-End | |
               +---------+-v---------+      +--------+
               |                     |      | DataSF |
               |                     |      |  API   |
               |      Node.JS        |      +--^-+---+
               |                     |         | |
               |                     +---------+ |
               |                     <-----------+
               |                     |
               +---------------------+

```
## For KQED ##
