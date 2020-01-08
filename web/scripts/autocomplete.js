var tz1Autocomplete; 
var tz2Autocomplete; 

var atzcAPIKey = "&key=AIzaSyDHenjijGq10yu852UxwVYc6e4Wp_5LAck"; 

var geocodeRequestBaseURL = "https://maps.googleapis.com/maps/api/geocode/json?place_id="; 
var timeZoneRequestBaseURL = "https://maps.googleapis.com/maps/api/timezone/json?location="
var timezoneRequestTimeStamp = "&timestamp=0"; 

// Spacetime vars
spacetime.extend(spacetimeGeo); 
var timezoneA = null; 
var timezoneB = null; 

$('#todslider').on("change mousemove", function() 
{
    $("#sliderValue").text($(this).val());
    var sliderValInt = parseInt($(this).val());
    
    if (timezoneA)
    {
        timezoneA = timezoneA.time("12:00pm").minute(sliderValInt); 
        $("#tz1time").text(timezoneA.time());

        if (timezoneB)
        {
            timezoneB = timezoneA.goto(timezoneB.timezone().name); 
            $("#tz2time").text(timezoneB.time());
        }
    }
});

function initAutocomplete() 
{
    /* 
    Create the time zone 1 and time zone 2 autocomplete objects, 
    restricting the search to geographical location types.
    */
    tz1Autocomplete = new google.maps.places.Autocomplete(document.getElementById('tz1'), { types: ['geocode'] });
    tz2Autocomplete = new google.maps.places.Autocomplete(document.getElementById('tz2'), { types: ['geocode'] });

    /* 
    When the user selects a location from the dropdown, 
    populate the timezone information. 
    */
    tz1Autocomplete.setOptions({fields: ["place_id"]});  
    tz1Autocomplete.addListener('place_changed', setTimeZoneName);

    tz2Autocomplete.setOptions({fields: ["place_id"]});  
    tz2Autocomplete.addListener('place_changed', setTimeZoneName);
}

async function setTimeZoneName() 
{ 
    // Get the place details from the autocomplete object.
    var placeID = this.getPlace()["place_id"];
    console.log("Got place id: " + placeID); 
    
    // Get the geocode details
    var geocodeRequestURL = geocodeRequestBaseURL + placeID + atzcAPIKey; 
    var geocodeResult = await $.get(geocodeRequestURL); 
    var location = geocodeResult.results[0].geometry.location; 

    // Get the timezone details
    // !!!! Spacetime is good enough at getting the timezone from a lat/lng point
    // So we can ignore getting the timezone name from google and save ourselves a request (and thus some $$)
    //var timeZoneRequestURL = timeZoneRequestBaseURL + location.lat + "," + location.lng + timezoneRequestTimeStamp + atzcAPIKey; 
    //var timezoneResult = await $.get(timeZoneRequestURL);

    // Set the name in the appropriate span
    //console.log("Google says the timezone is : " + timezoneResult.timeZoneId); 
    //this == tz1Autocomplete ? $("#tz1Name").text(timezoneResult.timeZoneId) : $("#tz2Name").text(timezoneResult.timeZoneId); 

    // Spacetime timezone
    var s = spacetime.now(); 
    s = s.in([location.lat, location.lng]); 
    console.log("Spacetime says the timezone is: " + s.timezone().name); 
    
    if (this == tz1Autocomplete)
    {
        timezoneA = spacetime("Today", s.timezone().name).time("12:00pm"); 
        $("#tz1Name").text(timezoneA.timezone().name);
        $("#tz1time").text(timezoneA.time());
    }
    else
    {
        if (timezoneA)
        {
            timezoneB = timezoneA.goto(s.timezone().name); 
        }
        else
        {
            timezoneB = spacetime("Today", s.timezone().name).time("12:00pm"); 
        }
        
        $("#tz2Name").text(timezoneB.timezone().name); 
        $("#tz2time").text(timezoneB.time());
    }
}

async function getPlaceGeocode(placeID)
{
    var geocodeRequestURL = geocodeRequestBaseURL + placeID + atzcAPIKey; 

    //console.log(geocodeRequestURL); 
    
    // // Construct XMLHttpRequest
    // var jqxhr = await $.ajax({
    //     url: geocodeRequestURL,
    //     method: "POST",
    //     dataType: "json",
    //     success: geocodeRequestSuccess,
    //     error: geocodeRequestFailure,
    // });

    // console.log(jqxhr);

    var result = await $.get(geocodeRequestURL); 
    console.log(result.results[0]); 

    var timeZoneRequestURL = timeZoneRequestBaseURL + result.results[0].geometry.location.lat + "," + result.results[0].geometry.location.lng + timezoneRequestTimeStamp + atzcAPIKey; 
    var result2 = await $.get(timeZoneRequestURL);
    console.log(result2.timeZoneId);
}

function geocodeRequestSuccess(data, textStatus, jqXHR)
{
    console.log("Geocode Request Success"); 
    console.log(`${JSON.stringify(data.results[0].geometry.location)}`); 

    getTimeZoneName(data.results[0].geometry.location);
}

function geocodeRequestFailure(jqXHR, textStatus, errorThrown)
{
    console.log(`Geocode Request Failed: Server returned a ${jqXHR.status} error`);
    console.log(`Response: ${jqXHR.responseJSON}`); 

    console.log(jqXHR);
}

function getTimeZoneName(placeLocation)
{
    var timeZoneRequestURL = timeZoneRequestBaseURL + placeLocation.lat + "," + placeLocation.lng + timezoneRequestTimeStamp + atzcAPIKey; 
    //console.log(timeZoneRequestURL); 
    
    // Construct XMLHttpRequest
    var jqxhr = $.ajax({
        url: timeZoneRequestURL,
        method: "POST",
        dataType: "json",
        success: timeZoneRequestSuccess,
        error: timeZoneRequestFailure,
    });
}

function timeZoneRequestSuccess(data, textStatus, jqXHR)
{
    console.log("Time Zone Request Success"); 
    console.log(`${JSON.stringify(data.timeZoneId)}`); 

    $("#tz1Name").text(data.timeZoneId); 
}

function timeZoneRequestFailure(jqXHR, textStatus, errorThrown)
{
    console.log(`Time Zone Request Failed: Server returned a ${jqXHR.status} error`);
    console.log(`Response: ${jqXHR.responseJSON}`); 

    console.log(jqXHR);
}
