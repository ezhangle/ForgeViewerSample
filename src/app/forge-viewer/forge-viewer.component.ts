import { Component, ViewChild, OnInit, OnDestroy, ElementRef } from '@angular/core';

// We need to tell TypeScript that Autodesk exists as a variables/object somewhere globally
declare const Autodesk: any;

@Component({
  selector: 'app-forge-viewer',
  templateUrl: './forge-viewer.component.html',
  styleUrls: ['./forge-viewer.component.scss']
})
export class ForgeViewerComponent implements OnInit , OnDestroy{

  @ViewChild('viewerContainer') viewerContainer: any;
  @ViewChild('viewer2DContainer') viewer2DContainer: any;
  private viewer: any;
  private viewer2D: any;

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
      getAccessToken: (onSuccess) => { this.getAccessToken(onSuccess) },
    };
 
    this.viewer = new Autodesk.Viewing.Private.GuiViewer3D(this.viewerContainer.nativeElement, {}); // The viewer
    //this.viewer2D = new Autodesk.Viewing.Private.GuiViewer3D(this.viewer2DContainer.nativeElement, {});  // The 2D viewer
  
    // Check if the viewer has already been initialised - this isn't the nicest, but we've set the env in our
    // options above so we at least know that it was us who did this!
    if (!Autodesk.Viewing.Private.env) {
      Autodesk.Viewing.Initializer(options, () => {
        this.viewer.initialize();
        //this.viewer2D.initialize();
        this.loadDocument();
      });
    } else {
      // We need to give an initialised viewing application a tick to allow the DOM element to be established before we re-draw
      setTimeout(() => {
        this.viewer.initialize();
        //this.viewer2D.initialize();
        this.loadDocument();
      });
    }
  }
 
  private loadDocument() {
    //const urn = `urn:${dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6Zm9yZ2VhcHAzOWM0MWRmMTkyNGY0NTNhOWNiMTQxMTdmMDZlMjU4Yi9MYW5kLmlmYw == }`;
    const urn =  "urn:" + "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6Zm9yZ2VhcHAzOWM0MWRmMTkyNGY0NTNhOWNiMTQxMTdmMDZlMjU4Yi9MYW5kLmlmYw";
 
    Autodesk.Viewing.Document.load(urn, (doc) => {
      const geometryItems = Autodesk.Viewing.Document.getSubItemsWithProperties(doc.getRootItem(), {type: 'geometry'}, true);
 
      if (geometryItems.length === 0) {
        return;
      }
 
      this.viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, this.geometryLoaded);
      this.viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, (event) => this.selectionChanged(event));
 
      this.viewer.load(doc.getViewablePath(geometryItems[0]));
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
       if (props.properties[1] != null)
       {
        console.log(props.properties[1].displayValue);
       }
       
    });
  }
 
  private getAccessToken(onSuccess: any) {
    const { access_token, expires_in } = 
    {
      access_token : "eyJhbGciOiJIUzI1NiIsImtpZCI6Imp3dF9zeW1tZXRyaWNfa2V5In0.eyJjbGllbnRfaWQiOiJlajhvbHFheEV0UHF1a2VhRlhYTXZBNjVqN2Zla1pBRyIsImV4cCI6MTUxOTEyNDgxMywic2NvcGUiOlsiZGF0YTpyZWFkIl0sImF1ZCI6Imh0dHBzOi8vYXV0b2Rlc2suY29tL2F1ZC9qd3RleHA2MCIsImp0aSI6IlR0TTNqV0o1bWVIZnNFR1A1TUJUd2o0emtXa0VNeUo5clIxZmNGVXZHZzFvNGxDZXBjeG1XYnZlY2JtNmdHNHYifQ.vELL5X-I2sfOSc93uXRf-6EG96UmKJgmTfsqoV6n4o4",
      expires_in: "3000"
    }
    onSuccess(access_token, expires_in);
  }

}

