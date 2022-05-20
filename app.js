import fetch from 'node-fetch';
import 'dotenv/config';
import { stringify } from 'querystring';


// env variables 
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;

// const token = "BQARjADsEZiGRMnCZUz_1_SG9cQIWaStyzxUnc8DE2GLkpWWPxDyUd80SwIBlfcwGtZo3NB9uCG0iL4UdNziAzGD2Dx2eAWRptklnvRll2CKWcT-RqKCrcJb0YgqtpsXEWQBWBAtDMJ6cixd4p_FdgkF4PAiDuIOfiXLzGaj";
// const token = process.argv.slice(2)[0];

// base spoitify url endpoint
const baseURL = 'https://api.spotify.com/v1';

// TODO: Testing with Postman(?)
// TODO: Make function to filter list of tracks by specified audio features


/**
 * Filters the given list of tracks by the specified audio feature
 * @param {spotify_track[]} tracks  the tracks to filter
 * @param {string} audiotFeature    the audio_feature to filter by
 * @returns {spotify_track[]}       a list of tracks sorted by the given audio feature
 */
const filterTracksByAudioFeature = async (tracks, audiotFeature) => {
    // for every track in tracks, get the audio features
}

/**
 * Data Defintions 
 * 
 * A URL is a string
 * 
 * A PlaylistNameAndTracks is :
 *   {
 *      playlistName : string (playlist.name)
 *      playlistTracks : [TrackData]
 *   }
 * 
 * A TrackData is 
 *   {
 *      name: string
 *      previewURL: URL
 *   }
 */


/**
 * Retrieves an auth token for this app. Requires client_id, client_secret.
 * @returns OAuth2 token
 */
const getAuthToken = async () => {
    const url = 'https://accounts.spotify.com/api/token';
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type' : 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(client_id + ':' + client_secret)
        },
        body: 'grant_type=client_credentials'
    });
    const data = await response.json();
    try {
        let token = await data.access_token;
        return await token;
    }
    catch(error) {
        console.error(error);
    }
}

/**
 * Returns a list of available genres.
 * Uses Get Available Genre Seeds Spotify Web API call:
 * 
 * API Reference	Get Available Genre Seeds
 * 
 * Endpoint	        https://api.spotify.com/v1/recommendations/available-genre-seeds
 * 
 * HTTP Method	    GET
 * 
 * OAuth	        Required
 * @returns {array} list of genres
 */
const getAvailableGenreSeeds = async () => {
    const url = baseURL + '/recommendations/available-genre-seeds';
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    });
    try {
        const data = checkFetch(await respose.json());
        return await data.genres;
    } catch(error) {
        console.log(error);
        return [];
    }
}

/**
 * Returns a list of trackData for every spotify_track in the given list of spotify_tracks. 
 * @param {spotify_track} tracks the tracks to derive trackData from
 * @returns {[TrackData]} trackDataList trackData of all given tracks
 */
function getTrackDataList(tracks) {
    let trackDataList = [];
    tracks.forEach((track) => {
        let trackPreviewURL = track.preview_url;
        if (trackPreviewURL !== null) {
            trackDataList = [...trackDataList, {name: track.name, previewURL: trackPreviewURL}];
        }
    });
    return trackDataList ;
}

/**
 * Prints out the information stored in the given trackData.
 * @param {trackData} trackData the trackData to print
 */
function printTrackData(trackData) {
    console.log("Song name: " + trackData.name + " Preview URL: " + trackData.previewURL);
}


/**
 * Returns a list of categories. 
 * Uses Get Several Browse Categories Spotify Web API call:
 * 
 * API Reference	https://developer.spotify.com/documentation/web-api/reference/#/operations/get-categories
 * 
 * Endpoint	        https://api.spotify.com/v1/browse/categories
 * 
 * HTTP Method	    GET
 *
 *  OAuth	        Required
 * @param {string} [country='US']   the country code to get categories from
 * @param {string} [locale='us_EN'] the locale code to get categories from
 * @param {number} [limit=50]       the number of categories for query to return
 * @returns {spotify_category[]}    a list of categories
 */
const getCategories = async (country='US', locale='us_EN', limit=50) => {
    const queryData = {
        country: country,
        locale: locale,
        limit: limit,
        offset: 0
    };
    let url = baseURL + '/browse/categories?' + stringify(queryData);
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type' : 'application/json',
            'Authorization': 'Bearer ' + token
        }
    });
    try {
        // const data = await response.json();
        const data = checkFetch(await response.json());
        const categoryList = await data.categories.items.map((item) => item.id);
        return categoryList;
    } catch (error) {
        console.error(error);
        return [];
    }
}

// TODO: genre:[genre_id] and return tracks
/**
 * Prints out the TrackData of the specified amount of tracks from the given search category.
 * Uses Search Spotify Web API Call:
 * 
 * API Reference	https://developer.spotify.com/documentation/web-api/reference/#/operations/search
 * 
 * Endpoint	        https://api.spotify.com/v1/search
 * 
 * HTTP Method	    GET
 * 
 * OAuth	        Required
 * @param {spotify_category} category   the spotify category to search for
 * @param {number} limit                the number of results to include in return (defualt = 5)
 */
const searchCategory = async (category, limit=5) => {
    const query = {
        q: category,
        type: 'category',
        offset: 0,
        limit: limit
    };
    let url = baseURL + '/search?' + stringify(query);
    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        }
    })
    const data = await response.json();
    let items = await data.tracks.items;
    let trackData = getTrackDataList(items);
    trackData.forEach((track) => {
        printTrackData(track);
    });
}


/**
 * Gets a list of the specified number of given category's playlists' tracks.
 * Uses Get Category's Playlist Spotify Web API call:
 * 
 * API reference    https://developer.spotify.com/documentation/web-api/reference/#/operations/get-a-categories-playlists
 * 
 * Endpoint	        https://api.spotify.com/v1/browse/categories/{category_id}/playlists
 * 
 * HTTP Method	    GET
 * 
 * OAuth	        Required
 * @param {string} categoryID           the spotify category_id
 * @param {string} [country='US']       the spotify country code
 * @param {number} [limit=2]            the number of results to return from API query
 * @param {number} [offset=0]           the offset of results
 * @returns {PlaylistNameAndTracks[]}   a list of PlaylistNameAndTracks
 */
const getCategoryPlaylist = async (categoryID, country='US', limit=2, offset=0) => {
    const query = {
        country: country,
        limit: limit,
        offset: offset
    }
    const url = baseURL + `/browse/categories/${categoryID}/playlists?` + stringify(query);
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    });
    try {
        const data = checkFetch(await response.json()); // data.items = playlists
        let playlists = await data.playlists.items;
        let playlistsData = playlists.length !== 0 ? await getPlaylistsData(playlists) : [];
        return playlistsData;
    } catch (error) {
        console.error("Error: ", error);
        return [];
    }
}

/**
 * Gets PlaylistNameAndTracks for the given list of spotify_playlists.
 * @param {spotify_playlist[]} playlists    playlists to get data for
 * @returns {PlaylistNameAndTracks[]}       a list of PlaylistNameAndTracks
 */
const getPlaylistsData = async (playlists) => {
    let listOfPlaylistsTracks = playlists.map(async (playlist) => {
        let playlistTracks = await getPlayListTracks(playlist);
        return { playlistName: playlist.name, playlistTracks: playlistTracks };
    });
    const results = await Promise.all(listOfPlaylistsTracks);
    return results;
}


/**
 * Gets the TrackData for every track in the given playlist's tracks.
 * Uses Get Playlist Spotify Web API call:
 * 
 * API Reference	https://developer.spotify.com/documentation/web-api/reference/#/operations/get-playlist
 * 
 * Endpoint	        https://api.spotify.com/v1/playlists/{playlist_id}
 * 
 * HTTP Method	    GET
 * 
 * OAuth	        Required
 * @param {spotify_playlist} playlist   the playlist to get the tracks of
 * @param {string} [fields='tracks']    the type to return
 * @param {string} [market='US']        the market to return tracks from
 * @returns {TrackData[]}               an array of the playlists' tracks data (name, previewURL)
 */
const getPlayListTracks = async (playlist, fields='tracks', market='US') => {
    const query = {
        fields: fields,
        market: market
    }
    const url = baseURL + '/playlists/' + playlist.id + '?' + stringify(query);
    
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    });
    const data = await response.json();
    try {
        let playlistTracks = await data.tracks.items; // list of spotify_tracks
        // for every track in tracks, get the name of the track and the preview url
        let listOfPlaylistTracks = await playlistTracks.map((playlistTrack) => {
            return { name: playlistTrack.track.name, previewURL: playlistTrack.track.preview_url };
        });
        return listOfPlaylistTracks;
    } catch (error) {
        console.log('playlist has no tracks');
        return [];
    }
}

/**
 * Returns the audio features of the specified track.
 * Uses Get Tracks' Audio Features Spotify Web API call:
 * 
 * API Reference	Get Tracks' Audio Features
 * 
 * Endpoint	        https://api.spotify.com/v1/audio-features
 * 
 * HTTP Method	    GET
 * 
 * OAuth	        Required
 * @param {string} trackID  the id of the track
 * @returns {array}         the audio features of the given track
 */
const getTrackAudioFeatures = async (trackID) => {
    const query = {
        ids: trackID
    };
    const url = baseURL + '/audio-features';
    const response = await fetch(url, {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
    });
    try {
        const data = checkFetch(await response.json());
        return await data.audio_features;
    } catch(error) {
        console.log(error);
        return [];
    }
}

/**
 * Prints out the name and previewURL of the given tracks
 * @param {TrackData[]} tracks the tracks to print
 */
const printTracks = (tracks) => {
    tracks.forEach((track) => console.log(track));
}

/**
 * Prints out the given PlaylistNameAndTrack object
 * @param {PlaylistNameAndTrack} pnt the object to print
 */
const printPlaylistNameAndTrack = (pnt) => {
    if (pnt) {
        console.log("playlist name: " + pnt.playlistName + "\ntracks: ");
        printTracks(pnt.playlistTracks);
    };
}

/**
 * Throws an error if the response contains an error, otherwise returns the reponse.
 * @param {JSON} response   the fetch JSON repsonse
 * @returns                 the fetch response
 */
const checkFetch = (response) => {
    if (response.error) {
        throw new Error(response.error.message);
    }
    return response;
}

// auth token
const token = await getAuthToken();

// gets the first 50 available categories, chooses a random one, and prints out the data for that category's first playlist
getCategories().then(categoryList => {
    let randIdx = Math.floor(Math.random() * categoryList.length);
    console.log('selected category: ', categoryList[randIdx]);
    // searchCategory(categoryList[randIdx], 10)
    getCategoryPlaylist(categoryList[randIdx]).then(l => {
        l.forEach((p) => printPlaylistNameAndTrack(p));
    });
});