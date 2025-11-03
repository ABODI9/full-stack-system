import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone:true, selector:'app-cost-analysis', imports:[CommonModule],
  template:`
  <h2>📉 Cost Analysis</h2>
  <div class="card">
    <h3>Form</h3>
    <iframe width="100%" height="420" frameborder="0" style="border-radius:12px"
      src="https://docs.google.com/spreadsheets/d/1KsFS9WggpDK5cKzjqlDLTPGp3N0Tenzd/edit?usp=sharing&ouid=113760053685891270873&rtpof=true&sd=true"></iframe>
    <h3>Data Table</h3>
    <iframe width="100%" height="420" frameborder="0" style="border-radius:12px"
      src="https://docs.google.com/spreadsheets/d/1T4SR36StAUXSzjg6Uhk5WT0W82o9u8Lo/edit?usp=sharing&ouid=113760053685891270873&rtpof=true&sd=true"></iframe>
  </div>`
})
export class CostAnalysisComponent {}
