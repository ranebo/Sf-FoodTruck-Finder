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
4. [Production](#production)
5. [Additional Feature Ideas and TODOS](#additional-feature-ideas-and-todos)
6. [For KQED](#for-kqed)


## Introduction

Food Trucks and other Street Food venders have exploded in popularity in the San Francsico Bay Area (Check out: https://offthegrid.com/).
There is most likely one right around the corner, but (up until now)
there has not been an easy way to browse SF Food Trucks or find the ones nearest you.
SF Food Truck Finder allows you to search for a particular Food Truck, find the ones near you,
or peruse the map and see what's out there!
(Thanks to: [DataSF](http://www.datasf.org/): [Food
Trucks](https://data.sfgov.org/Permitting/Mobile-Food-Facility-Permit/rqzj-sfat))

## Usage

Go to [SF Food Truck Finder](http://52.33.234.141:8000/) to see it in action!

## Development

### Requirements
- Node 5.x

### Installing Dependencies
Run `npm install` from the root directory.

### Development Server

Simply run `npm start` to fire up the express server and Webpack middleware, which serves a live, hot-reloading version of the application.

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
## Production ##

Setup Crontab (e.g. `crontab -e`) :
```
1 0 * * * /usr/local/bin/node /YOUR/PATH/TO/Sf-FoodTruck-Finder/server/cron.js

```

Run the following from project directory:
```
export NODE_ENV='production'
node ./node_modules/webpack/bin/webpack.js -p --config webpack.production.config.js
npm install -g forever
forever server/index.js

```

## Additional Feature Ideas and TODOS ##
  - Setup domain name and https: geolocation requires https for Chrome... works fine on localhost and Firefox
  - Center map Button to re-center map on current/choosen location
  - Make map movement transitions smoother
  - Show only nearby trucks Button (the same as displayed in closest list)
  - Links to vendor sites/menu
  - Filter by currently open trucks / Sort closest trucks list by distance
  - Add draggable features for markers (Main Marker, Route markers)
  - Google Directions:
    - Use google directions to more accurately find trucks within walking/bicycling/driving/transit distances
    - Better route paths and display and add directions (step-by-step) for walking/bicycling/driving/transit

## For KQED ##

- Description: See [Introduction](#introduction): This is a full stack application, but focused on front-end where most functionality and features lived.
- Google Map Features:
  - Autocomplete search for nearby Food Trucks by address, establishment, or geocode
  - Add Food Truck icons and Info Windows (with listeners)
  - Double Click on Food Truck to show route from current set location
- Other App Features:
  - Finds user location with 'Near Me' button(needs https for Chrome)
  - Autocomplete (by company name) search for specific Food Truck - submit shows truck on map
  - Leftside list of nearby Food Trucks with info - clicking one will show route to truck on map
  - Change walking time distance (i.e. change nearby distance check threshold for closest truck list)
  - Back-end uses a simple cache to serve faster responses, I have setup a cronjob to update cache
- Tech Stack Choice:
  - Font-End: [React.JS](https://facebook.github.io/react/) - Used React to take advantage of its Virtual DOM for light-weight and quick DOM manipulation and its component lifecycle system to correctly re-render on state changes. Furthermore, JavaScript is great for front-end development and Google Maps Javascript API has great [reference docs](https://developers.google.com/maps/documentation/javascript/).
  - Back-End: [Node.JS](https://nodejs.org/en/) - Used Node for a few reasons. First, becuase the back-end needed to be relatively simple (just fetches and sends food truck data from API and serves static files), it made sense to use a consistant language across the stack for rapid development. It has a single threaded non-blocking I/O allowing it to manage a fair amount of traffic. Furthermore, it is easy to scale with Node clusters (also [Ringpop](https://eng.uber.com/intro-to-ringpop/) is pretty cool). Webpack set up was mostly boiler plate ([Main Reference](https://github.com/christianalfoni/webpack-express-boilerplate))
- Note on Tests: I have never worked with google maps before, so a fair amount of time was used to research and understand how it works and not too much time on how to write tests for it. So tests are relatively light due to the time constraint and due to the fact that this app is mainly map feature rich. Always room for more tests.
- Resume / Public Profile: [Linkedin](https://www.linkedin.com/in/ranegridley)
- Hosted Cite: [SF Food Truck Finder](http://52.33.234.141:8000/) (deployed on Amazon EC2)

