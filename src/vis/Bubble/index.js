import { hierarchy,
         pack } from 'd3-hierarchy';
import { scaleOrdinal,
         schemeCategory20 } from 'd3-scale';
import { select } from 'd3-selection';

import VisComponent from 'candela/VisComponent';

import content from './index.jade';

export default class Bubble extends VisComponent {
  constructor (el, options) {
    super(el, options);

    // Respond to "add" and "delete" events from the data window; these are all
    // that will be needed to update the hierarchy data.
    options.dataWindow.on('added', d => this.add(d));
    options.dataWindow.on('deleted', d => this.remove(d));

    // Construct an initial hierarchy.
    this.data = {
      children: [
        {
          value: 0
        },
        {
          value: 0,
          children: []
        }
      ]
    };

    select(this.el)
      .html(content({
        width: '620.5px',
        height: '400px'
      }));
  }

  render () {
    select(this.el)
      .select('svg')
      .selectAll('*')
      .remove();

    let bubbles = pack()
      .size([620.5, 400])
      .padding(3);

    let root = hierarchy(this.data)
      .sum(d => d.value || 1);

    bubbles(root);

    const color = scaleOrdinal(schemeCategory20);

    const node = select(this.el)
      .select('svg')
      .selectAll('g')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('transform', d => `translate(${d.x}, ${d.y})`);

    node.append('circle')
      .attr('r', d => d.r)
      .style('stroke', 'black')
      .style('stroke-width', '1px')
      .style('fill', (d, i) => {
        if (d.depth === 0) {
          return 'lightgray';
        } else if (d.depth === 1) {
          return 'gray';
        } else {
          return color(i);
        }
      });
  }

  add (d) {
    if (d.anomalous) {
      if (this.getCluster(d.cluster) === undefined) {
        this.makeCluster(d.cluster);
      }

      this.incrementCluster(d.cluster);
    } else {
      this.incrementNormal();
    }
  }

  remove (d) {
    if (d.anomalous) {
      this.decrementCluster(d.cluster);
    } else {
      this.decrementNormal();
    }
  }

  incrementNormal () {
    this.data.children[0].value++;
  }

  decrementNormal () {
    this.data.children[0].value--;
  }

  getCluster (which) {
    return this.data.children[1].children[which];
  }

  makeCluster (which) {
    this.data.children[1].children[which] = {
      value: 0
    };
  }

  incrementCluster (which) {
    this.data.children[1].children[which].value++;
  }

  decrementCluster (which) {
    this.data.children[1].children[which].value--;
  }
}
