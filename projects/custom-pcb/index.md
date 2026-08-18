---
layout: project_case_study
title: "Custom PCB Hardware Platform"
description: "An engineering case study covering system architecture, PCB design, routing, bring-up, and hardware validation."
eyebrow: "Hardware group project · PCB design"
summary: "Replace this with a two-sentence summary of the problem, your technical contribution, and the measured outcome."
hero_image: "/assets/images/case-studies/custom-pcb/board-render.webp"
hero_alt: "3D render of the assembled custom PCB"
hero_caption: "Replace with a concise caption naming the board revision and the important visible subsystems."
role: "PCB Design & Hardware Validation"
team_size: "3 engineers"
timeline: "Month YYYY — Month YYYY"
tools:
  - "Altium Designer"
  - "LTSpice"
  - "Oscilloscope"
  - "Logic Analyzer"
source_url: ""
permalink: /projects/custom-pcb/
published: false
---

## Project overview

Open with the engineering problem, who the system was for, and the constraints that made the project difficult. State your individual ownership clearly within the group effort. End with the result in concrete terms: working revision, measured performance, successful integration, or lessons that informed the next spin.

> Use this space for the central design decision or constraint that shaped the board—for example, power integrity, RF isolation, thermal limits, form factor, or component availability.

### My contribution

- Owned **[subsystem or design responsibility]** from requirements through validation.
- Coordinated **[interface or integration responsibility]** with **[teammates or adjacent subsystem]**.
- Delivered **[specific artifact or measured result]**.

## System architecture

Explain the major functional blocks, signal flow, power domains, and external interfaces. Describe why this architecture was selected over the strongest alternative.

![System architecture block diagram](/assets/images/case-studies/custom-pcb/system-architecture.webp)
{: .case-study-wide-image}

![PCB layout showing the critical routing regions](/assets/images/case-studies/custom-pcb/layout-routing.webp)

*Replace with a caption that helps a reader understand the diagram without repeating the body text.*
{: .image-caption}

| Subsystem | Responsibility | Key constraint |
| --- | --- | --- |
| Power | [Regulation and sequencing] | [Efficiency, ripple, current] |
| Processing | [MCU, FPGA, or controller] | [I/O, timing, memory] |
| Interface | [Sensors, RF, USB, CAN, etc.] | [Impedance, protection, bandwidth] |

## Schematic design

Walk through the most consequential schematic decisions rather than listing every component. Good topics include power-tree design, analog front ends, clocking, protection, connector pinouts, and simulation results.

### Component selection

Explain the trade-offs behind two or three critical components. Include availability, package choice, performance margins, and how you verified the part was suitable.

### Simulation and design review

Document the LTSpice or signal-integrity checks you performed and what changed after review. Quantify expected voltage, current, ripple, gain, bandwidth, or thermal behavior where possible.

## Layout and routing

Describe the stack-up, placement strategy, return-current paths, controlled-impedance routes, plane splits, decoupling, and design-rule constraints that mattered to this board.



*Highlight the specific routing decision the reader should notice.*
{: .image-caption}

### Design-for-manufacture

Cover clearances, via choices, test points, assembly constraints, fiducials, panelization, or BOM decisions that reduced fabrication and bring-up risk.

## Bring-up and hardware validation

Present the bring-up sequence in the order it was performed. Explain how current limiting, staged rail checks, firmware smoke tests, and interface validation protected the board and isolated faults.

1. Inspected assembly quality and checked resistance to ground on every power rail.
2. Powered the board with a current-limited supply and verified rail sequencing.
3. Programmed the controller and tested interfaces one subsystem at a time.
4. Captured measurements under nominal and worst-case operating conditions.

### Results

Use a small table or chart for measured evidence. Replace every placeholder with real values before publishing.

| Test | Requirement | Measured | Result |
| --- | ---: | ---: | --- |
| [Power-rail ripple] | [< X mV] | [Y mV] | [Pass/Fail] |
| [Interface throughput] | [X Mbps] | [Y Mbps] | [Pass/Fail] |
| [Thermal rise] | [< X °C] | [Y °C] | [Pass/Fail] |

## What I learned

Reflect on the engineering judgment you developed: how you reviewed assumptions, communicated ownership in a team, debugged ambiguous hardware behavior, or balanced ideal design against schedule and fabrication limits.

## Next revision

Close with the highest-value changes you would make in a second board spin. Prioritize them and connect each change to evidence from validation rather than offering a generic wish list.
