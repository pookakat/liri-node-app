//require stuff
require("dotenv").config();
var keys = require("./keys.js");
var Spotify = require("node-spotify-api");
var axios = require("axios");
var moment = require("moment");
var fs = require('file-system');

//other global variables
var args = process.argv;
var spotify = new Spotify(keys.spotify);
var title = "";
var doThis = args[2];

//figure out how to process the command line stuff
function getTitle(){
    var nextThing = "";
    if (args.length<4){
        nextThing = "default";
    }
    else{
        nextThing = args[3];
        if (args.length>4){
            for (i=4; i<args.length; i++){
                nextThing = nextThing + " " + args[i]; 
            }
        }
    }
    direction(nextThing);
}

function direction(userQuery){
    switch (doThis){
        case commands[0]:{
                useThis = userQuery;
                break;
            }
        case commands[1]:{
            if (userQuery === "default"){
                useThis = "The Sign"
            }
            else{
                useThis = userQuery;
            } 
            break;
        };
        case commands[2]:{
            if (userQuery === "default"){
                useThis = "Mr. Nobody";
            }
            else{
                useThis = userQuery;
            }
            break;
        };
        case commands[3]:{
            useThis = "None";
            break;
        };
        case commands[4]:{
            useThis = "None";
            break;
        };
    };   
    commandPrompt(useThis);
} 

//now that this is done, let's make it act accordingly

commands = ['concert-this', 'spotify-this-song', 'movie-this', 'do-what-it-says', 'moo'];

function commandPrompt(title){
    fs.appendFile('log.txt', '\nCommand - ' + doThis + '\nAdditional Parameter -' + title, (err) => {
        if (err) throw err;
      });
      var toDo='';
      var foo='';
    switch (doThis) {
        case commands[0]:{
            toDo = 'Concert';
            axios.get("https://rest.bandsintown.com/artists/" + title + "/events?app_id=18982016-4489-49ce-9678-32dce1606300&date=upcoming").then(function(response) {
                foo = printConcert(response.data);
                for (i=0; i<foo.length; i++){
                    append(toDo, foo[i]);
                }
            });
            break;
        }
        case commands[1]:{
                toDo = "Song";
                spotify.search({ type: 'track', query: title})
                .then(
                    function(response) {
                        if (title === 'The Sign'){
                            for (var i = 0; i<response.tracks.items.length; i++){
                                for (var j=0; j<response.tracks.items[i].artists.length; j++){
                                    if (response.tracks.items[i].artists[j].name === 'Ace of Base'){
                                        foo = printSong(response.tracks.items[i]);
                                        append(toDo, foo);
                                    }
                                }
                            }
                        }
                        else{
                        foo = printSong(response.tracks.items[0]);
                        append(toDo, foo);
                        }
                })
                .catch(function(err) {
                console.log(err);
                });
            break;
        };
        case commands[2]:{
            toDo = 'Movie';
            axios.get("http://www.omdbapi.com/?t=" + title + "&y=&plot=short&apikey=trilogy").then(
            function(response) {
                foo = printMovie(response.data);
                append(toDo, foo);
                }
            );
            break;
        }
        case commands[3]:{
            var randomArray = []; 
            var commandArray = [];
            var theRandomThings = fs.readFile("random.txt", "utf-8", function(err, things){
                theRandomThings = things.toString();
                randomArray = theRandomThings.split('\n');
                var index = Math.floor(Math.random()*randomArray.length);           
                commandArray = randomArray[index].split(' ');
                doThis = commandArray.shift();
                var searchString = commandArray.join(' ');
                var useThis = searchString;
                fs.appendFile('log.txt', '\nThe computer randomly picked - ' + doThis + ': ' + useThis + ' from the random.txt file. \nComputer Autofill: ', (err) => {
                    if (err) throw err;
                  });
                commandPrompt(useThis);
            })
            break;
        }
        case commands[4]:{
            toDo = 'Cow sanity check!'
            foo = 'You have no cows!';
            console.log(foo);
            append(toDo, foo);
            break;
        }
    }
}

//printing functions

function printMovie(movieObject){
    var movieFoo = "Title of the movie: " + movieObject.Title + "\nYear the movie came out: " + movieObject.Year + "\nIMDB Rating of the movie: " + movieObject.imdbRating + "\nRotten Tomatoes Rating of the movie: " + movieObject.ratings + "\nCountry where the movie was Produced: " + movieObject.Country + "\nLanguage of the movie: " + movieObject.Language + "\nPlot of the movie: " + movieObject.Plot + "\nActors in the movie: " + movieObject.Actors;
    console.log(movieFoo);
    return movieFoo;
}

function printSong(songObject){
    var artists = getArtists(songObject.artists);
    var songFoo = 'Artist(s): '+ artists + "\nSong's Name: " + songObject.name +'\nPreview Link from Spotify: ' + songObject.external_urls.spotify + '\nAlbum: ' + songObject.album.name;
    console.log(songFoo);
    return songFoo;
}

function printConcert(concertObject){
    var concertFoo = [];
    for (var i = 0; i<concertObject.length; i++){
        var concertItem = "Name of the Venue: " + concertObject[i].venue.name + "\nVenue Location: " + concertObject[i].venue.city + ", " + concertObject[i].venue.region + "\nDate of Event: " + moment(concertObject[i].datetime).format("MM-DD-YYYY");
        concertFoo.push(concertItem);
        console.log(concertItem);
        console.log('~~~~');
    }
    return concertFoo;
}

function append(thing, returnData){
    fs.appendFile('log.txt', '\n' + thing + 
    ': ' + returnData + '\n=================', (err) => {
        if (err) throw err;
      });
}

//process what the api's are returning

function getArtists(artistArray){
    var artists=artistArray[0].name;
    for (var i = 1; i<artistArray.length; i++){
        artists = artists + ", " + artistArray[i].name;
    }
    return artists;
}

//start the ball rolling

nextThing = getTitle();
