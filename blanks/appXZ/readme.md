# M33
```
v 0.0.0.1               2025-10-14
```



## structure
```
m33                     < - engine root
    assets
        css
        cssme
        data
        icons
        images
        js
        sounds
    documents
    engine
        css3d
        generator
        modules
        sequences
        uii
        utils
        vector2d
        ...
        
GamePass             < - your game root
    resource
        js
        css
        data
        icons
        images
        sounds
    src
        actors
        components
        controllers
        managers
        modules
        plugins
        scenes
        screens
            views
        states
            actions
        systems
            layers
            hotkeys
            loops
            collisions
            loops
            sequences
            tasks
            tweens        
        
    favicon.ico
    index.html
    reload.js
    watch.sh
    watcher.php
    
    [alias] assets/
    [alias] engine/
    
```

# install

- copy `app/*` to your server folder and rename to same, example - `GamePass`

### create links to source engine 

example: First, create the folder `/var/app/GamePass`, this is the new root directory of the application. 
condition: root of engine `/var/app/m33`


### step Create aliases


```bash
ln -s /var/app/m33/assets /var/app/m33game/assets
ln -s /var/app/m33/engine /var/app/m33game/engine
```

