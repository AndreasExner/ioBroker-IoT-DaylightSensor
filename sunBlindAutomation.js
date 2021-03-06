// Update Sunlight Index South
on({id: '0_userdata.0.IoT.DaylightSensor.DayLight01', change: "any"}, async function (obj) {
    
    var value = obj.state.val; // get the current level of sunlight (the brighter the sun, the lower the value)
    var sunlightLevelSouth = getState("0_userdata.0.Tahoma.SunLightLevelSouth").val; // get the trigger level for the south blinds
    var sunlightIndexSouth = getState("0_userdata.0.Tahoma.SunLightIndexSouth").val; // get the current index for the south blinds

    
    // sun is brighter than the trigger -> increase index by 1, as long as it reaches 100%
    if (value <= sunlightLevelSouth && sunlightIndexSouth < 100) {
        setState("0_userdata.0.Tahoma.SunLightIndexSouth", sunlightIndexSouth + 1, true);
    }
  
    // sun is darker than the trigger -> decrase index by 1, as long as it reaches 0%
    if (value >= sunlightLevelSouth && sunlightIndexSouth > 0) {
        setState("0_userdata.0.Tahoma.SunLightIndexSouth", sunlightIndexSouth - 1, true);
    }
});

// Update Sunlight Index West
on({id: '0_userdata.0.IoT.DaylightSensor.DayLight02', change: "any"}, async function (obj) {
    
    var value = obj.state.val; // get the current level of sunlight (the brighter the sun, the lower the value)
    var sunlightLevelWest = getState("0_userdata.0.Tahoma.SunLightLevelWest").val; // get the trigger level for the West blinds
    var sunlightIndexWest = getState("0_userdata.0.Tahoma.SunLightIndexWest").val; // get the current index for the West blinds

    
    // sun is brighter than the trigger -> increase index by 1, as long as it reaches 100%
    if (value <= sunlightLevelWest && sunlightIndexWest < 100) {
        setState("0_userdata.0.Tahoma.SunLightIndexWest", sunlightIndexWest + 1, true);
    }
  
    // sun is darker than the trigger -> decrase index by 1, as long as it reaches 0%
    if (value >= sunlightLevelWest && sunlightIndexWest > 0) {
        setState("0_userdata.0.Tahoma.SunLightIndexWest", sunlightIndexWest - 1, true);
    }
});


// Open / Close Blinds West
on({id: '0_userdata.0.Tahoma.SunLightIndexWest', change: "ne"}, async function (obj) {
    var value = obj.state.val;
    var sunBlindsAutoWest = getState("0_userdata.0.Tahoma.SunBlindsAutoWest").val; // get automatic mode activation for the west blinds
    var sunlightIndexWest = getState("0_userdata.0.Tahoma.SunLightIndexWest").val; // get the current index for the West blinds
    var blindsWestPosition = getState("tahoma.0.devices.Esszimmerfenster_R.states.core:ClosureState").val; // get position of thr west blinds

    
    // index reached 100%. Close blinds if in auto mode and not yet closed otherwise
    if (sunBlindsAutoWest && sunlightIndexWest >= 100 && blindsWestPosition < 50) {
        setState("tahoma.0.actionGroups.EZ_Sonnenschutz50.commands.execute", true); // execute Tahoma scene (io)
        setState("tahoma.0.devices.Schlafzimmer_1.commands.close", true); // close RTS blinds
    }
    
    // index reached 0%. Open blinds if in auto mode and not fully closed otherwise
    if (sunBlindsAutoWest && sunlightIndexWest <= 0 && blindsWestPosition < 70) {
        setState("tahoma.0.actionGroups.EZ_Sonnenschutz00.commands.execute", true); // execute Tahoma scene (io)
    }
});

