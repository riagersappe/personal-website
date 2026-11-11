
document.addEventListener("DOMContentLoaded", function () {

    const container = d3.select("#d3-chart");

    if (container.empty()) return;

    // Experiences and projects where each language was used.
    // Edit these lists as your portfolio changes.
    const skills = [
        {
            name: "Java",
            professional: ["Babel Street"],
            projects: ["Object-Oriented Design Coursework"]
        },
        {
            name: "Python",
            professional: [],
            projects: ["Quant News Trading", "Data Analysis Coursework"]
        },
        {
            name: "JavaScript",
            professional: ["Quadrant Technologies"],
            projects: ["Portfolio Website"]
        },
        {
            name: "SQL",
            professional: ["Quadrant Technologies"],
            projects: ["Database Design Coursework"]
        },
        {
            name: "Swift",
            professional: [],
            projects: ["Smart Study Scheduler"]
        },
        {
            name: "HTML",
            professional: ["Quadrant Technologies"],
            projects: ["Portfolio Website"]
        },
        {
            name: "CSS",
            professional: ["Quadrant Technologies"],
            projects: ["Portfolio Website"]
        }
    ];

    const filters = [
        { label: "All", value: "all" },
        { label: "Professional", value: "professional" },
        { label: "Projects", value: "projects" }
    ];

    let activeFilter = "all";

    // Chart heading and explanation
    container.append("h3")
        .attr("class", "chart-heading")
        .text("Where I've Used My Programming Languages");

    container.append("p")
        .attr("class", "chart-description")
        .text(
            "Each bar represents the number of listed experiences " +
            "or projects where I've used that language. " +
            "Hover over a bar for more details."
        );

    // Filter buttons
    const controls = container.append("div")
        .attr("class", "chart-controls");

    controls.selectAll("button")
        .data(filters)
        .enter()
        .append("button")
        .attr("type", "button")
        .attr("class", d =>
            d.value === activeFilter
                ? "chart-filter active"
                : "chart-filter"
        )
        .text(d => d.label)
        .on("click", function (event, d) {
            activeFilter = d.value;

            controls.selectAll("button")
                .classed("active", item =>
                    item.value === activeFilter
                );

            updateChart();
        });

    // Tooltip
    const tooltip = container.append("div")
        .attr("class", "chart-tooltip")
        .style("display", "none");

    // SVG
    const margin = {
        top: 20,
        right: 45,
        bottom: 45,
        left: 110
    };

    const width = 760;
    const height = 420;

    const svg = container.append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("role", "img")
        .attr(
            "aria-label",
            "Interactive bar chart showing programming languages " +
            "used across projects and professional experiences"
        );

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const chart = svg.append("g")
        .attr(
            "transform",
            `translate(${margin.left}, ${margin.top})`
        );

    const x = d3.scaleLinear()
        .range([0, chartWidth]);

    const y = d3.scaleBand()
        .range([0, chartHeight])
        .padding(0.25);

    const xAxis = chart.append("g")
        .attr("class", "chart-axis")
        .attr(
            "transform",
            `translate(0, ${chartHeight})`
        );

    const yAxis = chart.append("g")
        .attr("class", "chart-axis");

    chart.append("text")
        .attr("class", "axis-title")
        .attr("x", chartWidth / 2)
        .attr("y", chartHeight + 40)
        .attr("text-anchor", "middle")
        .text("Number of Experiences / Projects");

    function getExperiences(skill) {
        if (activeFilter === "professional") {
            return skill.professional;
        }

        if (activeFilter === "projects") {
            return skill.projects;
        }

        return [
            ...skill.professional,
            ...skill.projects
        ];
    }

    function updateChart() {

        const data = skills.map(skill => ({
            ...skill,
            experiences: getExperiences(skill),
            count: getExperiences(skill).length
        }))
        .filter(skill => skill.count > 0)
        .sort((a, b) =>
            d3.descending(a.count, b.count) ||
            d3.ascending(a.name, b.name)
        );

        const maxCount = d3.max(data, d => d.count) || 1;

        x.domain([0, maxCount]);
        y.domain(data.map(d => d.name));

        const transition = d3.transition()
            .duration(600)
            .ease(d3.easeCubicOut);

        xAxis.transition(transition)
            .call(
                d3.axisBottom(x)
                    .ticks(maxCount)
                    .tickFormat(d3.format("d"))
                    .tickSizeOuter(0)
            );

        yAxis.transition(transition)
            .call(d3.axisLeft(y).tickSize(0));

        const bars = chart.selectAll(".skill-bar")
            .data(data, d => d.name);

        bars.exit()
            .transition(transition)
            .attr("width", 0)
            .remove();

        const newBars = bars.enter()
            .append("rect")
            .attr("class", "skill-bar")
            .attr("x", 0)
            .attr("y", d => y(d.name))
            .attr("height", y.bandwidth())
            .attr("width", 0)
            .attr("rx", 7);

        newBars.merge(bars)
            .on("mouseenter", function (event, d) {

                d3.select(this)
                    .attr("fill", "#d8c8ff");

                tooltip
                    .style("display", "block")
                    .html(
                        `<strong>${d.name}</strong>` +
                        `<p>${d.experiences.join("<br>")}</p>`
                    );
            })
            .on("mousemove", function (event) {

                const bounds = container.node()
                    .getBoundingClientRect();

                const tooltipWidth = 220;

                const left = Math.min(
                    event.clientX - bounds.left + 12,
                    bounds.width - tooltipWidth - 10
                );

                tooltip
                    .style("left", `${Math.max(5, left)}px`)
                    .style(
                        "top",
                        `${event.clientY - bounds.top - 65}px`
                    );
            })
            .on("mouseleave", function () {

                d3.select(this)
                    .attr("fill", "#a78bfa");

                tooltip.style("display", "none");
            })
            .transition(transition)
            .attr("y", d => y(d.name))
            .attr("height", y.bandwidth())
            .attr("width", d => x(d.count));

        const labels = chart.selectAll(".bar-value")
            .data(data, d => d.name);

        labels.exit().remove();

        labels.enter()
            .append("text")
            .attr("class", "bar-value")
            .merge(labels)
            .transition(transition)
            .attr("x", d => x(d.count) + 10)
            .attr("y", d =>
                y(d.name) + y.bandwidth() / 2 + 5
            )
            .text(d => d.count);
    }

    updateChart();
});