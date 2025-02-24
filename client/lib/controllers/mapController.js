import * as L from "leaflet";
import cryptoTools from "../cryptoTools";
import mapParams from "./mapParams";
import MiniMap from 'leaflet-minimap';
import iconMarker from "./markers/iconMarker";
import MapMarker from "../../../imports/classes/MapMarker";
import memberPosition from "./markers/memberPosition";
import {Draw} from 'leaflet-draw';
import polyline from "./markers/polyline";
import shape from "./markers/shape";
import arrow from "./markers/arrow";
import markerText from "./markers/markerText";
import activityMarker from "./markers/activityMarker";
import projectController from "./projectController";
import Activity from "../../../imports/classes/Activity";

const mapController = {
    map: {},
    minimap: {},
    currentLayer: {},
    drawControl: {},
    initialize(project, instance, callback) {
        let encryptedProjectMapParams = project.private.map
        cryptoTools.decryptObject(encryptedProjectMapParams, {symKey: Session.get("currentProjectSimKey")}, projectMapParams => {
            if (!projectMapParams.symEnc_mapProvider) {
                projectMapParams.symEnc_mapProvider = 0
            }
            if (!projectMapParams.symEnc_center) {
                projectMapParams.symEnc_center = JSON.stringify([47, 2.5])
            }


            this.map = L.map("map").setView(JSON.parse(projectMapParams.symEnc_center), projectMapParams.zoomLevel);

            this.currentLayer = L.tileLayer(
                mapParams.providers[projectMapParams.symEnc_mapProvider].url,
                mapParams.providers[projectMapParams.symEnc_mapProvider].options
            ).addTo(this.map);
            L.control.scale({
                imperial: false,
                maxWidth: 116
            }).addTo(this.map);
            //terminator().addTo(this.map);
            if (!Meteor.Device.isPhone()) {
                let osm2 = new L.TileLayer(mapParams.providers[0].url, {
                    minZoom: 0,
                    maxZoom: 13,
                    attribution: mapParams.providers[projectMapParams.symEnc_mapProvider].options.attribution
                });
                this.minimap = new L.Control.MiniMap(osm2, {
                    position: 'bottomleft',
                    width: 120,
                    height: 120,
                    zoomLevelOffset: -6
                }).addTo(this.map);
            }
            var drawnItems = new L.FeatureGroup();
            this.map.addLayer(drawnItems);
            this.drawControl = new L.Control.Draw({
                edit: {
                    featureGroup: drawnItems
                }
            });
            this.map.addControl(this.drawControl);
            this.promptMarkers(project._id, instance)
            this.promptActivityMarkers(project._id, instance)
            if(callback){
                Meteor.setTimeout(()=>{
                    callback()
                },300)

            }
        })


    },
    changeLayer(id) {
        let newLayer = L.tileLayer(
            mapParams.providers[id].url,
            mapParams.providers[id].options
        )

        this.map.addLayer(newLayer);
        window.setTimeout(() => {
            this.map.removeLayer(this.currentLayer);
            this.currentLayer = newLayer
        }, 2000)
    },
    getCenteringParams() {
        let centeringParams = {
            symEnc_center: JSON.stringify(this.map.getCenter()),
            zoomLevel: this.map.getZoom()
        }
        return centeringParams
    },
    iconMarker: iconMarker,
    memberPosition: memberPosition,
    polyline: polyline,
    shape: shape,
    arrow: arrow,
    markerText: markerText,
    activityMarker: activityMarker,
    startMarkerCreator(type, options, mapState) {
        this.offEvents()
        if (this[type].default) {
            this[type].default.initialize(options, mapState)
        } else {
            this[type].initialize(options, mapState)
        }

    },
    moveMarker(marker, mapState) {
        if (this[marker.markerType].default) {
            this[marker.markerType].default.moveMarker(marker, mapState)
        } else {
            this[marker.markerType].moveMarker(marker, mapState)
        }
        mapState.set({currentAction: "creatingIcon", type: 'iconMarker', options: {}, marker: marker})
    },
    stopEtitingMarker(mapState) {
        this[mapState.get().type].default.stopEditing(mapState.get().marker)
    },
    offEvents() {
        this.map.off("draw:created", this.addMarker);
        this.map.off('draw:drawvertex', this.limitPolyline);
    },
    stopMarkerCreator(mapState) {
        this.offEvents()
        if (mapState) {
            if (this[mapState.get().type]) {
                if (this[mapState.get().type].default) {
                    this[mapState.get().type].default.stop()
                } else {
                    this[mapState.get().type].stop()
                }
            }
            mapState.set({})
        }
    },
    addMarker(e) {

    },
    limitPolyline(e) {

    },
    editMarkerCreatorColor(mapState, color) {
        this.stopMarkerCreator(mapState)
        let newOptions = mapState.get().options
        if (newOptions) {
            newOptions.color = color
            this.startMarkerCreator(mapState.get().type, newOptions, mapState)
        }
    },
    markers: {},
    promptMarkers(projectId, instance) {
        instance.autorun(() => {
            let markers = MapMarker.find({projectId: projectId}).fetch()
            let markersIdtoRemove = Object.keys(this.markers)
            markers.forEach((marker) => {
                if (!this.markers[marker._id]) {
                    if (this[marker.markerType].default) {
                        this[marker.markerType].default.showMarker(marker)
                    } else {
                        this[marker.markerType].showMarker(marker)
                    }

                } else if (marker.lastEditAt.getTime() > this.markers[marker._id].lastEditAt.getTime()) {
                    if (this[marker.markerType].default) {
                        this[marker.markerType].default.editMarker(marker)
                    } else {
                        this[marker.markerType].editMarker(marker)
                    }
                }
                markersIdtoRemove.splice(markersIdtoRemove.indexOf(marker._id), 1)
            })
            markersIdtoRemove.forEach(id => {
                this.removeMarker(this.markers[id])
            })
        })

    },
    activities: [],
    promptActivityMarkers(projectId, instance) {

        Meteor.subscribe("mapActivitiesByProject", projectController.getAuthInfo(projectId), projectId, err => {
            if (err) {
                console.log(err)
            } else {
                instance.autorun(() => {
                    let activities = Activity.find({projectId: projectId, symEnc_coordinates: {$exists: true}}).fetch()
                    let markersIdtoRemove = Object.keys(this.activities)
                    activities.forEach((activity) => {
                        if (!this.activities[activity._id]) {

                            this.activityMarker.default.showMarker(activity)
                        } else if (activity.lastEditAt.getTime() > this.activities[activity._id].lastEditAt.getTime()) {

                            this.activityMarker.default.editMarker(activity)

                        }
                        markersIdtoRemove.splice(markersIdtoRemove.indexOf(activity._id), 1)
                    })
                    markersIdtoRemove.forEach(id => {
                        this.removeMarker(this.activities[id])
                    })
                })
            }
        })


    },
    removeMarker(marker) {
        if (marker) {
            if (this[marker.markerType].default) {
                this[marker.markerType].default.removeMarker(marker)
            } else {
                this[marker.markerType].removeMarker(marker)
            }
        }


    },
    reset(){
        this.activities = []
        this.markers = []
        let mapInstance=this.map
        if (mapInstance && mapInstance.remove) {
            console.log("in")
            mapInstance.off();
            mapInstance.remove();
        }
    }
}
export default mapController
