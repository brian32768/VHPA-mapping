# VHPA project rebooted

**Status**: Server works.
Client runs but shows only a map, so I can test Openlayers 10.

Architecture: 10 years ago I wrote this as a single page app in plain Javascript. Since then I've learned a ton of new stuff and wanted to try it all out here, including an Apollo backend. But you know, all that is a waste of time because it will make deployment more difficult. I won't have a resource rich server, I will have something like Bluehost or Hostmonster.

So, the basic architecture is

* a single page React app
* some data files (geojson) served as static content
* a zillion raster tiles served as static content

For testing that means I will need a static server, I think I can do this
most easily with just Node and Express. I could set up nginx but I don't need to.

Old notes from when this was a plain Javascript app:

See ARCHIVE/project_notes.txt
and ARCHIVE/presentation_notes.txt

2024-08-02-- day 2 of retirement, and I now have time to actually look at this project.

2023-11-02-- I have to rewrite because the API I wrote 10 years ago doesn't work now. 
The site looks like 1996 to me, I need to update it to 2023.

## Prerequisites

Today the server side runs Node Express. Just because I have never tried it. All I need is the little http-server from Node but I thought I'd try out Node Express.

Install nvm in three steps, crazy how easy this is compared to "apt", which installs about 50 (outdated) packages.

```bash
$ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.37.2/install.sh | bash
# log out and back in to refresh environment
$ nvm install node
.
.
Now using node v22.5.1 (npm v10.8.2)
```

## Major components

client side

* Openlayers 10
* React
* React-Bootstrap
* React-Router
* Parcel bundler

server side - there are no backend services here at all (yet), just some files.

* Node 22
* Express

## Testing and debugging

Run the static content server,

```bash
cd server
nvm install --lts
npm install
npm start
```

Then try http://localhost:8080/; this should give you some simple docs and links to test it.

### Browser app (A.K.A. the "client")

On the Desktop, what I normally have been doing on this project,

    cd client
    npm install
    npm start

It will look for content at the base URL of the server.

Debugging: The [Parcel site has tips.](https://parceljs.org/recipes/debugging/) 

Parcel builds source maps. ("source maps" are used to support VS Code debugging.) Check the contents of the launch.json file; there will be the setup to define the source map location. Then run the VS Code debugger, by selecting "Launch client" and hitting F5. This will open the app in Chrome. You should be able to do all the usual breakpoint / single-step / look at values things like a real program. (Come on, it IS a "real program" jeez get some self-esteem.)

I like to split the Terminal window and run client in the left side and server in the right.

## Deployment

I will come back and write this when there is something to deploy.
It's going to be "copy the files to the web server" but in more detail.

## Resources

book: [Express In Action](https://learning.oreilly.com/library/view/express-in-action/9781617292422/OEBPS/Text/kindle_split_001.html)

book: [Just React!](https://acm.percipio.com/books/4d3d2a3a-29d2-4672-8e1d-17eb80a6c7b3#epubcfi(/6/6!/4/2%5Bepubmain%5D/2%5Bintro%5D/8/3:112)) by Hari Narayn (c)2022

web: [Creating REST API in Node with Express and MySQL](https://dev.to/time2hack/creating-rest-api-in-node-js-with-express-and-mysql-21hk)

book: [Node in Action](https://acm.percipio.com/books/3fd43d52-8d0c-49ae-9802-43c65447dfce#epubcfi(/6/4!/4/2%5Bepubmain%5D/2%5Bg2eaae039-3fa1-4d43-9e2f-6b1b5949f648%5D/2/2/1:0)) (c)2017 backend orientation, but look at it for the database support (Chapter 8)

book: [Modern Full-Stack Development](https://acm.percipio.com/books/6bd6da5d-c9d1-4855-8e42-ca1b70735eac#epubcfi(/6/92!/4/2%5Bepubmain%5D/2%5Bch008_s1_2%5D/2/2/1:0)

Look for MERN = "Mongo Express React Node".
Mongo is a doc store (like CouchDB) that people seem to like.

book: [Pro MERN Stack](https://acm.percipio.com/books/bae08639-c985-47d7-9ad8-58a15dcb1402#epubcfi(/6/4!/4/2%5Bepubmain%5D/2%5Bg66aab88e-b283-4870-8aa1-1ce1c213b46b%5D/2/2/1:0)) (c)2019 Vasan Subramanian; Covers React Bootstrap, React Forms

book: [MERN Projects for Beginners](https://acm.percipio.com/books/cb85518c-3849-46a3-9424-ff4a3e28da46#epubcfi(/6/8!/4/2%5Bepubmain%5D/2%5Bch01lev1sec1%5D/2/2/1:0)) (c)2021 Very cloud based, including Google Firebase and Heroku

NVM: https://www.linode.com/docs/guides/how-to-install-use-node-version-manager-nvm/

### Fonts and glyphs

https://www.webhostinghub.com/glyphs/ [Examples](https://www.webhostinghub.com/glyphs/bootstrap/)

## TO DO

Modify start up files to work with Docker Swarm.
