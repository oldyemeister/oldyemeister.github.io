---
layout: project_case_study
title: "RF Frequency Downconversion System"
description: "Design and validation of an analog receiver chain with an RF limiter, 8–16 MHz bandpass filter, Gilbert-cell mixer, and low-pass filter."
eyebrow: "Analog hardware · RF and PCB design"
summary: "A three-person receiver project that filters and protects an incoming RF signal, downconverts it through a Gilbert-cell-style mixer, and isolates an approximately 100 kHz output for downstream processing."
hero_image: "/assets/images/pcb_manufacturing.jpg"
hero_alt: "PCB during manufacturing and assembly"
hero_caption: "PCB with all surface mount components."
role: "RF design, prototyping, and validation"
team_size: "3 engineers"
timeline: "January — April 2025"
collaborators:
  - name: "Michael Wei"
    url: "https://www.linkedin.com/in/minghan-wei-420802241/"
  - name: "Enpei Gu"
    url: "https://www.linkedin.com/in/enpei-gu-04520327b/"
tools:
  - "Altium Designer"
  - "LTspice"
  - "Oscilloscope"
  - "Function Generator"
source_url: ""
permalink: /projects/rf-receiver/
published: true
---

## Project overview

We designed and assembled an analog receiver chain for a software-defined-radio front end. The completed signal path combines an **8–16 MHz bandpass filter**, a **±0.7 V limiter**, a Gilbert-cell-style frequency mixer, and a low-pass filter. During bench testing, a 10 MHz RF input mixed with a 9.9 MHz local oscillator produced an approximately **100 kHz** output with **18 dB measured chain gain**.

| Parameter | Design or measured value |
| --- | ---: |
| RF passband | 8–16 MHz |
| Limiter threshold | ±0.7 V |
| Downconverted output | ≈100 kHz |
| Measured chain gain | 18 dB |
| I/Q phase target | 90° ±12.5° |

## Receiver architecture

The bandpass stage rejects signals outside the required shortwave range before the limiter clamps excessive positive and negative peaks. The protected RF signal then enters the Gilbert-cell mixer, where multiplication with the local oscillator generates sum- and difference-frequency components. A low-pass stage rejects the high-frequency products and retains the output near 100 kHz for the next receiver subsystem.

The complete design also generated in-phase and quadrature paths. A center-tapped RF transformer provided two balanced local-oscillator signals, allowing the two mixer paths to preserve the required phase relationship.

## Design decisions

### Passive bandpass filter

We selected a passive LC bandpass network because it required fewer components and less board area than an active alternative. LTspice frequency sweeps and breadboard measurements were used to tune the 8 MHz and 16 MHz cutoff regions. The main trade-off was loss from practical inductor quality factor, which could be recovered by a later gain stage.

### Limiter

Opposing 1N4148 diodes clamp both polarities of the incoming signal near ±0.7 V. This protects the mixer and downstream analog circuitry from high-amplitude inputs while adding little complexity to the RF path.

### Gilbert-cell mixer

Our first discrete mixer prototype produced approximately 33.75 dB of conversion loss, so the team redesigned the stage around a Gilbert-cell topology. We modelled the differential transistor network in LTspice, verified it on a breadboard, and implemented the final version with an HFA3101 transistor array. Compared with the initial design, the Gilbert cell produced a cleaner, more measurable downconverted output and was easier to isolate during debugging.

![LTspice schematic of the Gilbert-cell mixer and low-pass filter](/assets/images/LTspice_Schematic_Mixer.png)

*LTspice model used to evaluate the Gilbert-cell mixer, differential output, low-pass filter, and output stage.*
{: .image-caption}

![Breadboard prototype of the receiver mixer](/assets/images/mixer_prototype.png)

*Breadboard prototype used to test the mixer before committing the complete signal path to PCB.*
{: .image-caption}

![Oscilloscope output from the receiver-chain test](/assets/images/mixer_prototype_output.png)

*Output near 100 kHz during prototype validation.*
{: .image-caption}

This test shows the capability of the Gilbert-cell mixer and we decide to move on with this design that consists of 6 2N3904 BJTs

## PCB implementation

The Altium design contained more than 100 components across matched I and Q paths. The layout used compact surface-mount components, accessible through-hole test points, thicker RF-carrying traces, and a via fence around the local-oscillator region to reduce coupling. The board was assembled through a combination of reflow and through-hole soldering.

![PCB design](/assets/images/pcb_footprint.png)

*PCB footprint in Altium Designer.*
{: .image-caption}

![PCB during manufacturing and assembly](/assets/images/pcb_manufacturing.jpg)

*PCB with all surface mount components.*
{: .image-caption}

![Completed receiver subsystem during final integration](/assets/images/final_integration.png)

*Receiver subsystems with other subsystems for final test.*
{: .image-caption}

![Received target signal of final device](/assets/images/final_test.png)

*Received signal as shown by peak in this image.*
{: .image-caption}

Board bring-up exposed an incorrect copper connection and reversed operational-amplifier terminals. We isolated the affected stage, cut the incorrect trace, added a jumper connection, and resumed subsystem testing. This reinforced the importance of pin-level schematic review and staged validation before full-chain measurements.

## My contribution

I contributed to the receiver requirements, bandpass-filter and limiter design, circuit simulation, and prototype testing. I was directly involved in limiter and mixer verification, component selection, PCB assembly, debugging, and the iterative redesign from the underperforming mixer to the Gilbert-cell implementation. I also helped define the test procedures used to evaluate cutoff frequency, voltage limiting, downconversion, gain, and I/Q phase behavior.

## Hardware validation

For the in-phase path, we applied a **10 MHz, 200 mV peak-to-peak RF signal** and a **9.9 MHz, 3.3 V peak-to-peak local oscillator** with a 1.65 V offset. The measured output was approximately 100 kHz, confirming frequency downconversion through the complete chain. Separate I/Q measurements were used to check the required 90° ±12.5° phase relationship.

## Results and next revision

The project produced a functional receiver chain and was successfully integrated with the adjacent receiver subsystems. The prototype demonstrated RF selection, voltage protection, frequency downconversion, and low-pass filtering on physical hardware rather than simulation alone.

The next revision would replace the passive low-pass stage with an active filter for a more accurate passband and additional gain. Independent resistance adjustment on the I and Q output stages would also reduce the measured amplitude imbalance toward the required 1 dB limit. At the PCB level, a formal connection and footprint checklist would help prevent the trace and pin-orientation errors found during first-board bring-up.
