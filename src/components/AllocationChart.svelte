<script>
  import * as d3 from 'd3';

  import { onMount } from 'svelte';

  let el;

  export let values;
  export let height;
  export let margin;
  export let width;

  $: percentages = values.map((value) =>
    value.percentageUSD ? value.percentageUSD : value.percentage,
  );
  $: colors = values.map(({ color }) => color);

  $: color = d3.scaleOrdinal().domain(percentages).range(colors);

  const maths = (w, h, values) => {
    const radius = Math.min(w, h) / 2 - margin;

    const pie = d3.pie().value((d) => d.value);

    const data = pie(d3.entries(values));

    // Rotate 45 degrees forward
    data.forEach((wedge) => {
      wedge.endAngle = wedge.endAngle + Math.PI / 4;
      wedge.startAngle = wedge.startAngle + Math.PI / 4;
    });

    return { data, pie, radius };
  };

  const elPath = () => d3.select(el);
  const svgPath = () => elPath().select('svg');
  const gPath = () => svgPath().select('g');
  const whateverPath = () => gPath().selectAll('whatever');

  const adjustSize = (path, w, h) => path.attr('width', w).attr('height', h);
  const transformSize = (path, w, h) => path.attr('transform', `translate(${w / 2},${h / 2})`);
  const enter = (path, data, radius) => {
    path
      .data(data)
      .enter()
      .append('path')
      .attr('d', d3.arc().innerRadius(0).outerRadius(radius))
      .attr('fill', (d) => color(d.data.key))
      .attr('stroke', 'black')
      .style('stroke-width', '0px');
  };

  const renderGraph = (data, radius) => {
    adjustSize(svgPath(), width, height);
    transformSize(gPath(), width, height);
    enter(whateverPath(), data, radius);
  };

  onMount(() => {
    elPath().append('svg').append('g');

    if (width && height) {
      const { data, radius } = maths(width, height, percentages);
      renderGraph(data, radius);
    }
  });

  $: (() => {
    // TODO: Why does this not resize down??
    if (width && height) {
      const { data, radius } = maths(width, height, percentages);
      renderGraph(data, radius);
    }
  })();
</script>

<div bind:this={el} {height} {width} class="chart" />
