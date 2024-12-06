import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import MapView from '@arcgis/core/views/MapView';
import WebMap from '@arcgis/core/WebMap';
import { FormEvent, forwardRef, useEffect, useId, useRef, useState } from 'react';
import LayerList from '@arcgis/core/widgets/LayerList';
import Expand from '@arcgis/core/widgets/Expand';
import Graphic from '@arcgis/core/Graphic';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Polyline from '@arcgis/core/geometry/Polyline'
import Point from '@arcgis/core/geometry/Point'
import PopupTemplate from '@arcgis/core/PopupTemplate'
import * as geometryEngineAsync from '@arcgis/core/geometry/geometryEngineAsync'

interface TestWidgetProps {
  view?: __esri.MapView;
}

enum FormField {
  Layer = 'layer',
  Threshold = 'threshold',
}

const TestWidget = forwardRef<HTMLDivElement, TestWidgetProps>((props, ref) => {
  /* const [layer, setLayer] = useState<__esri.Layer>(); */
  

  /* const [selectedLayer, setSelectedLayer] = useState<string>('');
  const [threshold, setThreshold] = useState<string>('') */
  /* const handleExecuteClick = () => {
    if (!layer) return;
    if (layer.type !== 'feature') return;
    const fLayer = layer as __esri.FeatureLayer;
    
  } */
  /* 
    const handleLayerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedLayer(e.target.value);
      console.log('Selected Layer:', e.target.value);
    } */
      
  const layerId = useId();
  const { view } = props;
  const [layers, setLayers] = useState<__esri.Layer[]>([]);
  
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!view) return;
    const formData = new FormData(e.currentTarget);
    const layerId = formData.get(FormField.Layer)
    const threshold = formData.get(FormField.Threshold);
    if (typeof layerId !== 'string') return;
    if (typeof threshold !== 'string') return;

    const layer = view.map.findLayerById(layerId);
    if (!(layer instanceof FeatureLayer)) return;
    const response = await layer.queryFeatures({
      where: `Population > ${threshold}`,
      outFields: ['*'],
      returnGeometry: true
    });
    const features = response.features;
    const layerView = await view.whenLayerView(layer);
    layerView.highlight(features);
    view.goTo(features);
    features.sort((a,b) => a.attributes.Population - b.attributes.Population );
    const path: Array<[number,number]> = [];
    let totalPopulation = 0;
    features.forEach((feature) => {
      const geometry = feature.geometry;
      if (!(geometry instanceof Point)) return;
      path.push([geometry.x, geometry.y]);
      totalPopulation += feature.attributes.Population;
    }); 
    const polyline = new Polyline({
      paths: [path],
      spatialReference: layer.spatialReference
    });
    const length = await geometryEngineAsync.planarLength(polyline)
    const isIntersecting = await geometryEngineAsync.intersects(polyline, polyline);
    const popupTemplate = new PopupTemplate({
      title: 'Total population: {population}',
      content: `${length.toFixed(2)} m,
               ${isIntersecting}`
    })
    const graphic = new Graphic({
      geometry: polyline,
      attributes: {
        population: totalPopulation
      },
      popupTemplate
    })
    const graphicsLayer = new GraphicsLayer({
      graphics: [graphic],
      title: 'Pippo'
    });
    view.map.add(graphicsLayer)


  }

  useEffect(() => {
    if (!view) return;
    view.when(() => {
      setLayers(view.map.layers.toArray());
    });

  }, [view]);


  return (
    <div ref={ref} >
      <form onSubmit={handleSubmit} style={{ padding: '8px', backgroundColor: 'white', display: 'flex', flexDirection: 'column', rowGap: '8px' }}>
        <label htmlFor={layerId}>
          Layer
        </label>
        <select id={layerId} name={FormField.Layer} >
          {layers.map((layer) => (
            <option key={layer.id} value={layer.id}>
              {layer.title}
            </option>
          ))
          }
        </select>
        <input type="number" placeholder='Enter population threshold' name={FormField.Threshold} />
        <button type='submit'>Apply</button>
      </form>
    </div>
  );
});

function App() {
  const mapViewRef = useRef<HTMLDivElement>(null);
  const testWidgetRef = useRef<HTMLDivElement>(null);

  const [mapView, setMapView] = useState<MapView>();

  useEffect(() => {
    const mapViewEl = mapViewRef.current;
    if (!mapViewEl) return;
    const treesLayer = new FeatureLayer({
      url: 'https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/Landscape_Trees/FeatureServer/0'
    });

    const map = new WebMap({
      portalItem: {
        id: 'e691172598f04ea8881cd2a4adaa45ba'
      },
      layers: [treesLayer]
    });
    const view = new MapView({
      map,
      container: mapViewEl
    });
    
    setMapView(view);

    const layerListWidget = new LayerList({
      view: view,
    });

    const layerListExpand = new Expand({
      view: view,
      content: layerListWidget,
    });

    view.ui.add(layerListExpand, 'top-right');


    const testWidgetEl = testWidgetRef.current;
    if (testWidgetEl) {
      view.ui.add(testWidgetEl, 'top-right');
    }
  }, []);

  return (
    <div
      ref={mapViewRef}
      style={{ height: '100%' }}
    >
      <TestWidget ref={testWidgetRef} view={mapView} />
    </div>
  );
}

export default App;
