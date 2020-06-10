const axios = require('axios');
const http = require('https');
const fs = require('fs');
const Twitter = require('twitter');

require('dotenv/config');

var photo;
var file = fs.createWriteStream("file.jpg");

const config = {
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token_key: process.env.ACCESS_TOKEN_KEY,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET
}

const T = new Twitter(config);

axios.defaults.headers.common['Accept-Version'] = 'v1';
axios.defaults.headers.common['Authorization'] = `Client-ID ${process.env.UNSPLASHED_CLIENT_ID}`;


var tweetPhoto = function() {
    axios.get('https://api.unsplash.com/photos/random',{
        params: {
            query: 'cute cat'
        }
    }).then(function(response) {
        photo = response.data;
        return new Promise(function(resolve, reject){
            var request = http.get(response.data.urls.regular + "&q=40&fit=crop", function(response) {
                response.pipe(file);
                response.on('close', function() {
                    resolve();
                });
                response.on('end', function() {
                    resolve();
                });
                response.on('finish', function() {
                    resolve();
                });
            })
        })
    }).then(() => {
        var data = fs.readFileSync(`${__dirname}/file.jpg`);
    
        return T.post('media/upload', { media: data })
    }).then(media => {
        console.log('Media uploaded');
    
        var status = {
            status: `credits to ${photo.user.name} at https://unsplash.com/@${photo.user.username} #cat #cats #cattwitter #gato #gatos #cute`,
            media_ids: media.media_id_string
        }
    
        return T.post('statuses/update', status)
    }).then(tweet => {
        console.log(tweet);
    }).catch(function(error) {
        console.log(error);
    });
}

tweetPhoto();

setInterval(function(){
    tweetPhoto();
}, 3600000);

