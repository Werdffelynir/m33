

```js

UIIChart = new UIIChart ( uii, 'keyName', {
    x: 0,
    y: 0,
    z: 0,
    width: 30,
    height: 30,
    vertical: false,
    haft: false,
    percent: 0,
    title: 'title',
    desc: 'desc',
})


this.uii.create(UIIChart, 'Chart2', {
    width: 300,
    height: 40,
    vertical: false,
    haft: true,
    percent: 70,
    title: 'Chart 2',
    onchange:(percent) => {
        console.log('Chart2 ',percent)
    },
})


```

