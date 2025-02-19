import { IGirderItem, IGirderFolder } from "@/girder";
import { ITileHistogram } from "./images";

export interface IDatasetConfigurationMeta {
  id: string;
  datasetId: string;
  datasetName: string;
  name: string;
  description: string;
}

export interface IFrameInfo {
  DeltaT: number;
  PositionX: number;
  PositionY: number;
  PositionZ: number;
  IndexXY?: number;
  IndexZ?: number;
  IndexC?: number;
  IndexT?: number;
}

export interface IImage {
  item: IGirderItem;
  levels: number;
  frameIndex: number;
  key: {
    z: number;
    xy: number;
    t: number;
    c: number;
  };
  keyOffset: number;
  frame: IFrameInfo;
  sizeX: number;
  sizeY: number;
  tileWidth: number;
  tileHeight: number;
  mm_x: number;
  mm_y: number;
  tileinfo: any;
}

export interface IImageTile {
  x: number;
  y: number;
  width: number;
  height: number;
  frame: number;
  url: string;
  image: HTMLImageElement;
  fullImage: HTMLImageElement;
}

export interface IToolTemplateInterface {
  id: string;
  name: string;
  type: string;
  meta: any;
}

export interface IToolTemplate {
  name: string;
  description: string;
  interface: IToolTemplateInterface[];
}

export interface IToolConfiguration {
  readonly id: string;
  readonly _girder: IGirderItem;

  name: string;
  description: string;

  hotkey: string | null;

  type: string;

  values: any;

  template: IToolTemplate;

  configurationId: string;
  datasetId: string;
}

export interface IDataset {
  readonly id: string;
  readonly _girder: IGirderFolder;

  name: string;
  description: string;

  xy: number[];
  z: number[];
  time: number[];
  channels: number[];
  channelNames: Map<number, string>;
  width: number;
  height: number;
  images(z: number, zTime: number, xy: number, channel: number): IImage[];
  anyImage(): IImage | null;

  configurations: IDatasetConfiguration[];
}

export interface IViewConfiguration {
  layers: IDisplayLayer[];
}

export interface IToolSet {
  name: string;
  toolIds: string[];
}

export interface IDatasetConfiguration {
  readonly id: string;
  readonly _girder: IGirderItem;

  name: string;
  description: string;

  view: IViewConfiguration;
  toolset: IToolSet;

  snapshots?: any[];
}

export declare type DisplaySliceType =
  | "current"
  | "max-merge"
  | "constant"
  | "offset";

export interface IDisplaySlice {
  type: DisplaySliceType;
  value: number | null;
}

export interface IDisplayLayer {
  readonly id: string; // to have better keys for UI
  name: string;
  color: string;

  // TODO: boolean or which channel to use? why multiple allowed and how to combine
  channel: number;

  xy: IDisplaySlice;
  z: IDisplaySlice;
  time: IDisplaySlice;

  visible: boolean;

  contrast: IContrast;

  _histogram?: {
    promise: Promise<null | ITileHistogram>;
    lastHistogram: null | ITileHistogram;
    lastImages: IImage[] | null;
    nextImages: IImage[] | null;
    lock: boolean;
  };
}

export interface IGeoJSAnnotation {
  options: (key?: string, value?: any) => any;
  style: (value?: { [key: string]: any }) => any;
}

export interface IGeoJSPoint {
  x: number;
  y: number;
  z?: number; // Optional z coordinate
}

export declare type WorkerInterfaceType =
  | "number"
  | "text"
  | "tags"
  | "layer"
  | "select"
  | "channel";

export interface IWorkerInterfaceElement {
  type: WorkerInterfaceType;
  min?: number;
  max?: number;
  default?: number;
  items?: any[];
}

export interface IWorkerInterface {
  [id: string]: IWorkerInterfaceElement;
}

export interface IWorkerInterfaceValues {
  [id: string]: {
    type: WorkerInterfaceType;
    value: any;
  };
}

export interface IWorkerLabels {
  isUPennContrastWorker: string;
  isAnnotationWorker?: string;
  isPropertyWorker?: string;
  interfaceName?: string;
  interfaceCategory?: string;
  annotationShape?: AnnotationShape;
}

export interface IWorkerImageList {
  [image: string]: IWorkerLabels;
}

export enum AnnotationShape {
  Point = "point",
  Line = "line",
  Polygon = "polygon"
}

export const AnnotationNames = {
  [AnnotationShape.Point]: "Point",
  [AnnotationShape.Line]: "Line",
  [AnnotationShape.Polygon]: "Blob"
};

export interface IAnnotationLocation {
  XY: number;
  Z: number;
  Time: number;
}

export interface IAnnotationBase {
  tags: string[];
  shape: AnnotationShape;
  channel: number;
  location: IAnnotationLocation;
  coordinates: IGeoJSPoint[];
  datasetId: string;
}

export interface IAnnotation extends IAnnotationBase {
  id: string;
  name: string | null;
}

export interface IAnnotationConnectionBase {
  label: string;
  tags: string[];
  parentId: string;
  childId: string;
  datasetId: string;
}

export interface IAnnotationConnection extends IAnnotationConnectionBase {
  id: string;
}

export interface IAnnotationFilter {
  id: string;
  exclusive: boolean;
  enabled: boolean;
}

export interface ITagAnnotationFilter extends IAnnotationFilter {
  tags: string[];
}

export interface IShapeAnnotationFilter extends IAnnotationFilter {
  shape: AnnotationShape;
}

export interface IPropertyAnnotationFilter extends IAnnotationFilter {
  propertyId: string;
  range: {
    min: number;
    max: number;
  };
  // Whether to exclude or include annotations that don't have the property
}

export interface IIdAnnotationFilter extends IAnnotationFilter {
  annotationIds: string[];
}

export interface IROIAnnotationFilter extends IAnnotationFilter {
  roi: IGeoJSPoint[];
}

export interface IAnnotationPropertyConfiguration {
  name: string;
  image: string;

  tags: {
    tags: string[];
    exclusive: boolean;
  };
  shape: AnnotationShape;
  workerInterface: IWorkerInterfaceValues;
}

export interface IAnnotationProperty extends IAnnotationPropertyConfiguration {
  id: string;
}

export interface IAnnotationPropertyValues {
  [annotationId: string]: {
    [propertyId: string]: number;
  };
}

export interface ISerializedData {
  annotations: IAnnotation[];
  annotationConnections: IAnnotationConnection[];
  annotationProperties: IAnnotationProperty[];
  annotationPropertyValues: IAnnotationPropertyValues;
}

export interface IComputeJob {
  jobId: string;
  callback: (success: boolean) => void;
  datasetId: string | null;
}
export interface IAnnotationComputeJob extends IComputeJob {
  tool: IToolConfiguration;
}
export interface IPropertyComputeJob extends IComputeJob {
  propertyId: string;
  annotationIds: string[];
}

export interface IContrast {
  mode: "percentile" | "absolute";
  blackPoint: number;
  whitePoint: number;
  savedBlackPoint: number;
  savedWhitePoint: number;
}

export interface IUISetting {
  dataset: Readonly<IDataset>;
  configuration: IDatasetConfiguration;
  z: number;
  time: number;
  activeLayer: IDisplayLayer;
}

export interface IMapEntry {
  map: any;
  imageLayers: any[];
  params: any;
  baseLayerIndex: number | undefined;
  annotationLayer?: any;
  workerPreviewLayer?: any;
  workerPreviewFeature?: any;
  textLayer?: any;
  uiLayer?: any;
  scaleWidget?: any;
  lowestLayer?: number;
}

export interface ILayerStackImage {
  layer: IDisplayLayer;
  images: IImage[];
  urls: (string | undefined)[];
  fullUrls: (string | undefined)[];
  hist: ITileHistogram | null;
  singleFrame: number | null;
  baseQuadOptions?: {
    baseUrl: string;
    restRequest: (params: any) => Promise<any>;
    restUrl: string;
    maxTextures: number;
    maxTextureSize: number;
    query: string;
    frameBase?: number;
    frameStride?: number;
    frameGroup?: number;
    frameGroupStride?: number;
  };
}

export function isConfigurationItem(item: IGirderItem) {
  return item.meta.subtype === "contrastConfiguration";
}

export function isDatasetFolder(folder: IGirderFolder) {
  return folder.meta.subtype === "contrastDataset";
}

// Fallback colors for channels with unknown names or with duplicate colors.
// Keep the same uppercase/lowercase as the `channelColors` color values.
const colors = [
  "#FF0000",
  "#00FF00",
  "#0000FF",
  "#FFFF00",
  "#FF00FF",
  "#00FFFF",
  "#FF8000",
  "#FF0080",
  "#00FF80",
  "#80FF00",
  "#8000FF",
  "#0080FF",
  "#FF8080",
  "#80FF80",
  "#8080FF",
  "#FFFF80",
  "#80FFFF",
  "#FF80FF",
  "#FF4000",
  "#FF0040",
  "#00FF40",
  "#40FF00",
  "#4000FF",
  "#0040FF",
  "#FF4040",
  "#40FF40",
  "#4040FF",
  "#FFFF40",
  "#40FFFF",
  "#FF40FF",
  "#FFC000",
  "#FF00C0",
  "#00FFC0",
  "#C0FF00",
  "#C000FF",
  "#00C0FF",
  "#FFC0C0",
  "#C0FFC0",
  "#C0C0FF",
  "#FFFFC0",
  "#C0FFFF",
  "#FFC0FF",
  "#FF8040",
  "#FF4080",
  "#40FF80",
  "#80FF40",
  "#8040FF",
  "#4080FF",
  "#FF80C0",
  "#FFC080",
  "#C0FF80",
  "#80FFC0",
  "#80C0FF",
  "#C080FF",
  "#FFC040",
  "#FF40C0",
  "#40FFC0",
  "#C0FF40",
  "#C040FF",
  "#40C0FF"
];

// keys should be all uppercase.  Values should have the same case as the
// `colors` list.
const channelColors: { [key: string]: string } = {
  BRIGHTFIELD: "#FFFFFF",
  DAPI: "#0000FF",
  A594: "#FF0000",
  CY3: "#FF8000", // orange
  CY5: "#FF00FF",
  YFP: "#00FF00",
  GFP: "#00FF00"
};

function randomId() {
  return Math.random()
    .toString(36)
    .substr(2, 5);
}

export function newLayer(
  dataset: IDataset,
  layers: IDisplayLayer[]
): IDisplayLayer {
  const usedColors = new Set(layers.map(l => l.color));
  const nextColor = colors.filter(c => !usedColors.has(c));
  const usedChannels = new Set(layers.map(l => l.channel));
  const nextChannel = dataset.channels
    .map((_, i) => i)
    .filter(c => !usedChannels.has(c));

  const channelName =
    dataset.channelNames.get(nextChannel[0] || 0) ||
    `Channel ${nextChannel[0] || 0}`;
  let channelColor = channelColors[channelName.toUpperCase()];
  if (!channelColor || usedColors.has(channelColor)) {
    channelColor = nextColor[0] || colors[layers.length % colors.length];
  }
  let layerName = channelName;
  if (layerName === "" || layers.some(l => l.name === layerName)) {
    layerName = `Layer ${layers.length + 1}`;
  }

  // guess a good new layer
  return {
    id: randomId(),
    name: layerName,
    visible: true,
    channel: nextChannel[0] || 0,
    time: {
      type: "current",
      value: null
    },
    xy: {
      type: "current",
      value: null
    },
    z: {
      type: "current",
      value: null
    },
    color: channelColor,
    contrast: {
      mode: "percentile",
      blackPoint: 0,
      savedBlackPoint: 0,
      whitePoint: 100,
      savedWhitePoint: 100
    }
  };
}

export enum AnnotationSelectionTypes {
  ADD = "ADD",
  TOGGLE = "TOGGLE",
  REMOVE = "REMOVE"
}

export const AnnotationSelectionTypesNames = {
  [AnnotationSelectionTypes.ADD]: "Add",
  [AnnotationSelectionTypes.TOGGLE]: "Toggle",
  [AnnotationSelectionTypes.REMOVE]: "Remove"
};

export const AnnotationSelectionTypesTooltips = {
  [AnnotationSelectionTypes.ADD]: "Add annotations to selection",
  [AnnotationSelectionTypes.TOGGLE]: "Toggle annotations selection",
  [AnnotationSelectionTypes.REMOVE]: "Remove annotation from selection"
};
