---
layout: project_case_study
page_class: rf-receiver
title: "RF Frequency Downconversion System"
description: "Design and validation of an analog receiver chain with an RF limiter, 8–16 MHz bandpass filter, Gilbert-cell mixer, and low-pass filter."
eyebrow: "Analog hardware · RF and PCB design"
summary: "An analog RF receiver built from simulation to PCB: filtering, voltage protection, and downconversion to a 100 kHz output."
hero_image: "/assets/images/projects/rf-receiver/pcb_manufacturing-1600.webp"
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
source_url: ""
permalink: /projects/rf-receiver/
published: true
---

## The result

A working RF receiver front end with **18 dB measured chain gain**. Mixing a 10 MHz input with a 9.9 MHz local oscillator produced an output near **100 kHz**.

| Parameter | Design or measured value |
| --- | ---: |
| RF passband | 8–16 MHz |
| Limiter threshold | ±0.7 V |
| Downconverted output | ≈100 kHz |
| Measured chain gain | 18 dB |
| I/Q phase target | 90° ±12.5° |

## Circuit design

The signal passes through an LC bandpass filter, opposing 1N4148 limiter diodes, a Gilbert-cell mixer, and a low-pass filter. A center-tapped transformer supplies balanced local-oscillator signals for the I/Q paths.

Our initial discrete mixer had **33.75 dB conversion loss**. We redesigned it around an HFA3101 transistor array, then verified the circuit in LTspice and on a breadboard. The passive LC filter saved board area, at the cost of inductor loss.

![LTspice schematic of the Gilbert-cell mixer and low-pass filter](/assets/images/projects/rf-receiver/LTspice_Schematic_Mixer.webp)

*LTspice model of the revised mixer and output filter.*
{: .image-caption}

![Breadboard prototype of the receiver mixer](/assets/images/projects/rf-receiver/mixer_prototype.webp)

*Breadboard validation before PCB layout.*
{: .image-caption}

![Oscilloscope output from the receiver-chain test](/assets/images/projects/rf-receiver/mixer_prototype_output.webp)

*Prototype output near 100 kHz.*
{: .image-caption}

## From schematic to PCB

The Altium board contains **100+ components** across matched I/Q paths, with surface-mount parts, accessible test points, thicker RF traces, and a via fence around the local oscillator. We assembled it using reflow and through-hole soldering.

![PCB design](/assets/images/projects/rf-receiver/pcb_footprint.webp)

*PCB layout in Altium Designer.*
{: .image-caption}

Bring-up revealed an incorrect trace and reversed op-amp terminals. We isolated the stage, cut the trace, and added a jumper before resuming tests.

![Completed receiver subsystem during final integration](/assets/images/projects/rf-receiver/final_integration.webp)

*Receiver integrated with the adjacent subsystems.*
{: .image-caption}

![Received target signal of final device](/assets/images/projects/rf-receiver/final_test.webp)

*Target signal received by the integrated system.*
{: .image-caption}

## My contribution

I worked on requirements, bandpass-filter and limiter design, simulation, component selection, and prototype testing. I also helped verify and redesign the mixer, assemble and debug the PCB, and define tests for cutoff frequency, limiting, gain, downconversion, and I/Q phase.

## Validation & next steps

Bench inputs were **10 MHz at 200 mVpp** and a **9.9 MHz, 3.3 Vpp local oscillator** with a 1.65 V offset. The output confirmed downconversion near 100 kHz; separate measurements checked the I/Q phase target.

Next: an active low-pass filter for better passband control and gain, independent I/Q adjustments toward the 1 dB imbalance limit, and a pin-and-footprint checklist to prevent bring-up errors.
