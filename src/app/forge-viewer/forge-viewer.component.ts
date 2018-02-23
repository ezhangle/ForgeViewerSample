import { Component, ViewChild, OnInit, OnDestroy, ElementRef, AfterViewInit } from '@angular/core';

// We need to tell TypeScript that Autodesk exists as a variables/object somewhere globally
declare const Autodesk: any;

@Component({
  selector: 'app-forge-viewer',
  templateUrl: './forge-viewer.component.html',
  styleUrls: ['./forge-viewer.component.scss']
})
export class ForgeViewerComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('viewerContainer') viewerContainer: any;
  @ViewChild('viewer2DContainer') viewer2DContainer: any;
  private viewer: any;
  private viewer2D: any;

  private selectedElement: number[];

  constructor() { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.launchViewer();
  }

  ngOnDestroy() {
    if (this.viewer && this.viewer.running) {
      this.viewer.removeEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, this.selectionChanged);
      this.viewer.tearDown();
      this.viewer.finish();
      this.viewer = null;
    }
  }

  private launchViewer() {
    if (this.viewer) {
      return;
    }

    const options = {
      env: 'AutodeskProduction',
      getAccessToken: (onSuccess) => { this.getAccessToken(onSuccess) }
    };

    this.viewer = new Autodesk.Viewing.Private.GuiViewer3D(this.viewerContainer.nativeElement, {}); // The viewer
    this.viewer2D = new Autodesk.Viewing.Private.GuiViewer3D(this.viewer2DContainer.nativeElement, {});  // The 2D viewer

    const urn = "urn:" + "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6YmltNDJfYnVja2V0X3Rlc3QvT2ZmaWNlX01FUF8yMDExMDgxMS5pZmM";
    const urn2D = "urn:" + "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6YmltNDJfYnVja2V0X3Rlc3QvUGxhbiUyMENWQyUyMEMlMjBOMCUyMGluZCUyMEEuZHdn";

    // Check if the viewer has already been initialised - this isn't the nicest, but we've set the env in our
    // options above so we at least know that it was us who did this!
    if (!Autodesk.Viewing.Private.env) {
      Autodesk.Viewing.Initializer(options, () => {
        this.viewer.initialize();
        this.viewer2D.initialize();
        this.loadDocument(urn, this.viewer);
        this.loadDocument(urn2D, this.viewer2D);
      });
    } else {
      // We need to give an initialised viewing application a tick to allow the DOM element to be established before we re-draw
      setTimeout(() => {
        this.viewer.initialize();
        this.viewer2D.initialize();
        this.loadDocument(urn, this.viewer);
        this.loadDocument(urn2D, this.viewer2D);
      });
    }
  }

  private loadDocument(urn, viewer) {

    Autodesk.Viewing.Document.load(urn, (doc) => {
      const geometryItems = Autodesk.Viewing.Document.getSubItemsWithProperties(doc.getRootItem(), { type: 'geometry' }, true);

      if (geometryItems.length === 0) {
        return;
      }

      // // Filter for the 2D view
      // const Views2D = geometryItems.filter(item => item.name === "2D View");
      // let viewable = geometryItems[0];
      // if (Views2D.length !== 0) {
      //   viewable = Views2D[0];
      // }
      viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, this.geometryLoaded);
      viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, (event) => this.selectionChanged(event));

      viewer.load(doc.getViewablePath(geometryItems[0]));

    }, errorMsg => console.error);
  }

  private geometryLoaded(event: any) {
    const viewer = event.target;

    viewer.removeEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, this.geometryLoaded);
    viewer.setLightPreset(8);
    viewer.fitToView();
    // viewer.setQualityLevel(false, true); // Getting rid of Ambientshadows to false to avoid blackscreen problem in Viewer.
  }

  private selectionChanged(event: any) {
    const model = event.model;
    const dbIds = event.dbIdArray;

    // Get properties of object
    this.viewer.getProperties(dbIds[0], (props) => {
      // Do something with properties
      if (props.properties[1] != null) {
        console.log(props.properties[1].displayValue);
      }

    });
  }

  private getAccessToken(onSuccess: any) {
    const { access_token, expires_in } = {
      access_token: "eyJhbGciOiJIUzI1NiIsImtpZCI6Imp3dF9zeW1tZXRyaWNfa2V5In0.eyJjbGllbnRfaWQiOiJlajhvbHFheEV0UHF1a2VhRlhYTXZBNjVqN2Zla1pBRyIsImV4cCI6MTUxOTI5NDEzMSwic2NvcGUiOlsiZGF0YTp3cml0ZSIsInZpZXdhYmxlczpyZWFkIiwiYnVja2V0OnJlYWQiLCJkYXRhOnJlYWQiXSwiYXVkIjoiaHR0cHM6Ly9hdXRvZGVzay5jb20vYXVkL2p3dGV4cDYwIiwianRpIjoiZ3ZtOE02UDB2eHBGRGtrMEliWm9ZRjlHWkd1SHRrRXVaSEdGQmtCY1NWbWpzWjRBY1RQam4xbG5nTHJNYUZyeCJ9.vs_gW1yPe7JS8BZZiJNKNexjhiKDxRAeh6R7-wzYkQk",
      expires_in: "3000"
    }
    onSuccess(access_token, expires_in);
  }

  public SearchElements() {
    let searchProperties: string = "System Name";
    let searchPropList: string[] = searchProperties.split(',');
    this.ZoomToElement();
    // this.viewer.search("Mechanical Supply Air 2",  this.ZoomToElement, this.searchErrorCallback, searchPropList);
  }

  // Callback for _viewer.search() on success.
  private searchCallback(ids) {
  }

  public ZoomToElement() {
    // ids: number[]
    let dbId = 14630;
    // this.selectedElement = ids;
    this.viewer.impl.selector.setSelection([dbId], this.viewer.model);
    this.viewer.fitToView([dbId], this.viewer.model);
    this.viewer.isolateById([dbId]);

    let dbId2d = 11459;
    this.viewer2D.impl.selector.setSelection([dbId2d], this.viewer2D.model);
    this.viewer2D.fitToView([dbId2d], this.viewer2D.model);
    this.viewer2D.isolateById(dbId2d);
  }



  // Callback for _viewer.search() on error.

  private searchErrorCallback() {

    console.log("error in search");
  }
}

