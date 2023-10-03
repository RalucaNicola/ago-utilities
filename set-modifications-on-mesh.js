const graphicsLayer = new GraphicsLayer();
view.map.add(graphicsLayer);
const imLayer = view.map.allLayers.find((layer) => {
    return layer.type === "integrated-mesh";
}) as IntegratedMeshLayer;

const modificationSymbol = {
    type: "polygon-3d", // autocasts as new PolygonSymbol3D()
    symbolLayers: [
        {
            type: "line", // autocasts as new LineSymbol3DLayer()
            material: {
                color: [133, 148, 209]
            },
            size: "7px"
        }
    ]
};

const sketchSymbol = {
    type: "polygon-3d", // autocasts as new PolygonSymbol3D()
    symbolLayers: [
        {
            type: "fill", // autocasts as new FillSymbol3DLayer()
            material: {
                color: [255, 255, 255, 0.8]
            },
            outline: {
                size: "3px",
                color: [82, 82, 122, 1]
            }
        }
    ]
};
const sketchViewModel = new SketchViewModel({
    layer: graphicsLayer,
    view: view,
    polygonSymbol: sketchSymbol,
    updateOnGraphicClick: false,
    defaultCreateOptions: {
        mode: "click"
    }
});

view.on("key-up", function (event) {
    if (event.key === "m") {
        sketchViewModel.create("polygon");
    }
    if (event.key === "s") {
        view.map.updateFrom(view).then(function () {
            view.map.save({ ignoreUnsupported: true }).then((message) => { console.log("success", message) }).catch(err => console.log(err))
        })
    }
});
sketchViewModel.on("create", (event) => {
    if (event.state === "complete") {
        updateModificationType(
            event.graphic,
            'replace'
        );
        updateIntegratedMesh();
        sketchViewModel.update(event.graphic, {
            enableZ: true
        });
    }
});
sketchViewModel.on("update", (event) => {
    updateIntegratedMesh();
});

function updateModificationType(graphic, modificationType) {
    graphic.attributes = { modificationType: modificationType };
    graphic.symbol = modificationSymbol;
}

// update the IntegratedMesh with the modifications
function updateIntegratedMesh() {
    // create the modification collection with the geometry and attribute from the graphicsLayer
    let modifications = new SceneModifications(
        graphicsLayer.graphics.toArray().map((graphic) => {
            return new SceneModification({
                geometry: graphic.geometry,
                type: graphic.attributes.modificationType
            });
        })
    );

    // add the modifications to the IntegratedMesh
    imLayer.modifications = modifications;
}
