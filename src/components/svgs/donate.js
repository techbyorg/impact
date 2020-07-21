import { z, useContext } from 'zorium'

import context from '../../context'

export default function $home (props) {
  const { colors } = useContext(context)

  return z('svg', { xmlns: 'http://www.w3.org/2000/svg', 'xmlns:xlink': 'http://www.w3.org/1999/xlink', width: '109', height: '132' },
    [
      z('defs',
        z('path', { id: 'a', d: 'M11.227 16.938a1.92 1.92 0 01-2.587-.01l-.106-.096C3.484 12.262.185 9.272.31 5.539c.058-1.635.895-3.203 2.25-4.126C5.1-.32 8.237.489 9.93 2.47c1.693-1.982 4.829-2.8 7.368-1.058 1.356.923 2.193 2.491 2.25 4.126.135 3.732-3.174 6.724-8.223 11.312l-.097.087z' })
      ),
      z('g', { fill: 'none', 'fill-rule': 'evenodd' },
        [
          z('circle', { cx: '59.876', cy: '69.972', r: '6.709', fill: '#FFD071', 'fill-rule': 'nonzero' }),
          z('path', { fill: '#FFBA2D', 'fill-rule': 'nonzero', d: 'M59.876 63.263a6.709 6.709 0 110 13.418 6.709 6.709 0 010-13.418zm0 .992a5.718 5.718 0 100 11.435 5.718 5.718 0 000-11.435z' }),
          z('path', { fill: '#933A31', 'fill-rule': 'nonzero', d: 'M1.617 3.783c28.75 45.601 45.272 68.402 49.567 68.402 6.444 0-4.46-7.435-4.46-15.365 0-4.6 5.034-4.621 9.913 0 3.533 3.346 6.473 8.317 7.93 6.443 1.999-2.569-1.139-9.109-6.443-14.87-2.51-2.726 20.353-5.342 20.338-7.628-.016-2.285-4.78-1.122-20.338-.798-1.203.025 11.867-10.38 8.426-10.41-2.295-.019-21.359 10.294-22.305 10.41-7.55.926-15.316-12.127-23.297-39.158L1.618 3.783z' }),
          z('path', { fill: '#4C1813', 'fill-rule': 'nonzero', d: 'M59.02 39.451c2.065-.048 4.043-.113 6.122-.197l6.102-.269 1.33-.053.688-.022c.87-.024 1.556-.03 2.136-.015l.369.012c2.193.093 3.182.582 3.19 1.855.006.842-1.07 1.4-3.377 2.102l-.668.198c-.844.245-1.646.455-3.118.81l-5.414 1.286-1.01.247c-1.995.494-3.325.866-4.454 1.254l-.393.14c-.898.326-1.53.634-1.871.91l-.095.079c-.146.127-.153.17-.088.247l.356.392c5.446 6.047 8.239 12.435 6.134 15.14-.788 1.013-1.852.725-3.159-.46l-.207-.192c-.352-.335-.737-.74-1.211-1.269l-.602-.682c-.416-.476-1.105-1.265-1.454-1.66l-.479-.531a30.659 30.659 0 00-1.551-1.594c-4.617-4.372-9.077-4.366-9.077-.36 0 2.444 1.013 4.908 3.006 8.039l.25.388.105.159 1.755 2.626.208.324c.463.728.76 1.268.95 1.747.652 1.652-.128 2.58-2.309 2.58-4.499 0-20.296-21.676-48.259-65.9L.795 3.409 21.3.253l.36 1.214c7.82 26.228 15.422 38.879 22.524 38.008l.03-.008c.214-.068 1.276-.573 3.008-1.44l8.84-4.454 1.038-.514c5.397-2.662 8.474-4.005 9.453-3.997.678.006 1.12.372 1.067.993-.034.392-.274.852-.7 1.431-.61.827-1.595 1.887-3.002 3.265l-.377.367-1.231 1.175c-.87.823-2.357 2.228-2.759 2.622l-.34.34-.192.196zM2.44 4.158l.842 1.334 1.649 2.605C31.626 50.214 47.32 71.69 51.184 71.69l.231-.003c1.25-.027 1.487-.291 1.208-1.08l-.053-.141c-.174-.441-.477-.98-.968-1.743l-.326-.495c-.317-.472-1.153-1.713-1.582-2.365l-.305-.472c-2.087-3.278-3.161-5.892-3.161-8.571 0-5.207 5.624-5.215 10.75-.36a31.59 31.59 0 011.599 1.642l.546.607 1.863 2.126.254.283c.409.451.744.801 1.047 1.09l.179.165c.935.848 1.407.976 1.71.586 1.715-2.205-1.064-8.417-6.417-14.23-.54-.586-.386-1.26.269-1.79.473-.383 1.248-.752 2.336-1.137l.27-.094c1.412-.483 3.112-.939 5.956-1.62l3.402-.81c5.706-1.373 7.977-2.092 7.974-2.51-.003-.512-.458-.766-1.95-.856l-.291-.015-.263-.009c-.677-.02-1.514-.01-2.652.028l-.868.032-6.874.301c-2.345.094-4.566.164-6.934.213a.555.555 0 01-.555-.74c.044-.139.13-.274.267-.444.154-.193.385-.442.702-.762l.31-.308c.48-.472 2.468-2.348 3.167-3.01l.827-.792.368-.358c1.373-1.345 2.332-2.376 2.903-3.15.248-.338.408-.611.475-.791l.017-.051-.069-.003c-.797-.006-4.35 1.58-10.083 4.429l-1.451.724-7.943 4.006-.857.424c-1.064.52-1.616.763-1.86.815l-.047.008c-7.887.967-15.694-12.084-23.71-39.095L2.44 4.158z' }),
          z('path', { fill: colors.$primary300, 'fill-rule': 'nonzero', d: 'M31.47 79.003l56.079.119a3 3 0 012.35 1.142l6.1 7.736v28.34c0 2.68-2.16 4.851-4.827 4.851H27.827c-2.666 0-4.827-2.172-4.827-4.851V88l6.096-7.838a3 3 0 012.375-1.159z' }),
          z('path', { fill: colors.$primary500, 'fill-rule': 'nonzero', d: 'M23 88.125h73v37.215c0 2.68-2.162 4.851-4.828 4.851H27.827c-2.666 0-4.827-2.172-4.827-4.851V88.125z' }),
          z('g', { transform: 'translate(49.685 99.81)' },
            [
              z('mask', { id: 'b', fill: '#fff' },
                z('use', { 'xlink:href': '#a' })
              ),
              z('g', { fill: '#FFF', 'fill-rule': 'nonzero', mask: 'url(#b)' },
                z('path', { d: 'M-1.617-2.426h23.085v23.085H-1.617z' })
              )
            ]
          ),
          z('path', { fill: colors.$primary900, 'fill-rule': 'nonzero', d: 'M50.766 84.612h18.232c.356 0 .644-.333.644-.743 0-.411-.288-.744-.644-.744H50.766c-.355 0-.644.333-.644.744 0 .41.289.743.644.743z' }),
          z('g',
            [
              z('path', { stroke: '#69CAB7', d: 'M72.3 61.86c1.985.152 3.617.867 4.895 2.145 1.277 1.279 1.96 2.88 2.047 4.801' }),
              z('path', { stroke: '#4BE6C8', d: 'M73.014 57.349c2.992.228 5.451 1.305 7.377 3.233 1.927 1.927 2.955 4.34 3.086 7.237' }),
              z('path', { fill: '#7282FF', 'fill-rule': 'nonzero', d: 'M72.601 68.792l24.164-20.075-.95-1.144-24.164 20.075z' }),
              z('path', { fill: '#4BE6C8', 'fill-rule': 'nonzero', d: 'M32.897 62.548l3.966 9.914 1.38-.553-3.965-9.913z' }),
              z('path', { fill: '#FF5419', 'fill-opacity': '.67', 'fill-rule': 'nonzero', d: 'M37.844 70.975l-6.939 1.982.408 1.431 6.939-1.984zM29.418 73.453l-4.557 1.302.409 1.43 4.556-1.302zM100.438 70.67c.984.451 2.326.216 3.21-.516 1.057-.876 1.237-2.24.295-3.545-.278-.387-.698-.736-1.218-1.029.897-1.237 1.855-1.897 2.488-1.718l.062.02a.744.744 0 10.534-1.387c-1.536-.591-3.164.526-4.492 2.502a9.098 9.098 0 00-3.897-.252c-3.534.548-6.686 3.075-8.918 7.768a.744.744 0 101.343.638c2.028-4.265 4.776-6.467 7.803-6.937a7.745 7.745 0 012.7.07l.188.04c-1.013 1.975-1.282 3.802-.098 4.345zm2.3-3.191c.481.668.417 1.151-.04 1.53-.426.353-1.088.49-1.534.35-.02-.152.001-.391.07-.69.108-.48.325-1.053.614-1.635l.1-.194c.351.191.624.41.79.639z' })
            ]
          ),
          z('path', { fill: colors.$primary900, d: 'M23 88h73v2H23z' })
        ]
      )
    ]
  )
}
