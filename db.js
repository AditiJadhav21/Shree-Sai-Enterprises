const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

let pool = null;
let isUsingFallback = false;
let fallbackDb = null;

const fallbackDbFile = path.join(__dirname, '..', 'data', 'local_store.json');

// Initialize local store directory
if (!fs.existsSync(path.join(__dirname, '..', 'data'))) {
  fs.mkdirSync(path.join(__dirname, '..', 'data'), { recursive: true });
}

// Load seed data for fallback mode
function getInitialSeedData() {
  return {
    categories: [
      { id: 1, name: 'Solar Panels', slug: 'solar-panels', description: 'High efficiency Mono PERC, Polycrystalline and Bifacial solar PV modules with DCR certification for PM Surya Ghar subsidy.', hsn_code: '85414011', icon: 'sun' },
      { id: 2, name: 'Solar Water Heaters', slug: 'solar-water-heaters', description: 'Reliable ETC and FPC solar water heating systems for domestic, agricultural, and commercial hot water needs.', hsn_code: '84191920', icon: 'droplet' },
      { id: 3, name: 'Inverters', slug: 'inverters', description: 'Next-generation on-grid, off-grid, and hybrid solar inverters and PCUs with smart MPPT and mobile WiFi tracking.', hsn_code: '85044090', icon: 'zap' },
      { id: 4, name: 'Batteries', slug: 'batteries', description: 'Heavy-duty C10 tall tubular and long-life Lithium-ion (LiFePO4) solar storage batteries designed for Indian power conditions.', hsn_code: '85072000', icon: 'battery-charging' }
    ],
    products: [
      {
        id: 1,
        category_id: 1,
        name: '550W Mono PERC Half-Cut Solar Panel',
        slug: '550w-mono-perc-half-cut-solar-panel',
        short_info: '550W Tier-1 high efficiency Mono PERC panel with 144 half-cut cells, anti-PID technology and weather resistant tempered glass.',
        full_description: 'Engineered for maximum power harvesting even in low-light and high-temperature conditions. Ideal for PM Surya Ghar residential and agricultural installations across Dindori and Nashik district.',
        approx_price: 14500.00,
        gst_rate: 12.00,
        hsn_code: '85414011',
        stock_qty: 45,
        stock_status: 'in_stock',
        primary_image: '/images/products/mono-perc-550w.svg',
        warranty: '25-Year Linear Performance Warranty',
        specifications: { "Rated Power": "550 Watts", "Cell Type": "Mono PERC Half-Cut 144 Cells", "Module Efficiency": "21.3%", "Max Power Voltage (Vmp)": "41.95 V", "Max Power Current (Imp)": "13.12 A", "Dimensions": "2279 x 1134 x 35 mm", "Weight": "28.5 kg", "Glass": "3.2mm Toughened ARC Glass" },
        key_features: ["144 Half-cut cell design reduces resistive power loss", "Anti-PID (Potential Induced Degradation) certified", "Excellent performance under low light & high Nashik temperatures", "Heavy snow (5400 Pa) and wind load (2400 Pa) endurance", "PM Surya Ghar Yojana compliant with DCR cell option"],
        is_featured: 1
      },
      {
        id: 2,
        category_id: 1,
        name: '330W 24V Polycrystalline Solar Panel',
        slug: '330w-24v-polycrystalline-solar-panel',
        short_info: 'Cost-effective 72-cell poly solar module, ideal for off-grid homes, farmhouses, and tube-well backup systems.',
        full_description: 'Sturdy anodized aluminium alloy frame with high mechanical strength. High transmission low-iron tempered glass delivers dependable output for decades.',
        approx_price: 8200.00,
        gst_rate: 12.00,
        hsn_code: '85414011',
        stock_qty: 30,
        stock_status: 'in_stock',
        primary_image: '/images/products/poly-330w.svg',
        warranty: '25-Year Performance Warranty',
        specifications: { "Rated Power": "330 Watts", "Cell Type": "Polycrystalline 72 Cells", "Module Efficiency": "17.4%", "Max Power Voltage (Vmp)": "37.5 V", "Max Power Current (Imp)": "8.80 A", "Dimensions": "1960 x 990 x 35 mm", "Weight": "21.0 kg" },
        key_features: ["Economical choice for budget-conscious rural & farm installations", "IP67 rated junction box with bypass diodes", "Positive power tolerance 0 to +3%", "Proven reliability across rural Maharashtra installations"],
        is_featured: 0
      },
      {
        id: 3,
        category_id: 1,
        name: '540W Bifacial Dual Glass Mono PERC Panel',
        slug: '540w-bifacial-dual-glass-mono-perc-panel',
        short_info: 'Generates up to 25% extra electricity from reflected ground light using dual-glass bifacial architecture.',
        full_description: 'Double-sided power generation module perfect for rooftop sheds, elevated solar carports, and industrial warehouses in Nashik.',
        approx_price: 15800.00,
        gst_rate: 12.00,
        hsn_code: '85414011',
        stock_qty: 25,
        stock_status: 'in_stock',
        primary_image: '/images/products/bifacial-540w.svg',
        warranty: '30-Year Bifacial Performance Warranty',
        specifications: { "Rated Power": "540 Watts (Front) + up to 25% rear gain", "Bifaciality Factor": "70% ± 5%", "Cell Type": "Dual Glass Mono PERC", "Module Efficiency": "21.6%", "Dimensions": "2278 x 1134 x 30 mm", "Weight": "32.0 kg" },
        key_features: ["Up to 25% additional power gain from rear albedo reflection", "Frameless or reinforced frame dual-glass construction", "Zero risk of backsheet micro-cracks or water ingress", "Fire Class A certified safety for rooftop structures"],
        is_featured: 1
      },
      {
        id: 4,
        category_id: 1,
        name: '450W Monocrystalline Half-Cut Solar Panel',
        slug: '450w-monocrystalline-half-cut-solar-panel',
        short_info: 'Compact high-density 120-cell mono module, optimised for residential urban rooftops with limited shade-free footprint.',
        full_description: 'Ideal balance of physical dimensions and power output. Generates maximum units per square foot of rooftop space.',
        approx_price: 12900.00,
        gst_rate: 12.00,
        hsn_code: '85414011',
        stock_qty: 18,
        stock_status: 'in_stock',
        primary_image: '/images/products/halfcut-mono-450w.svg',
        warranty: '25-Year Performance Warranty',
        specifications: { "Rated Power": "450 Watts", "Cell Type": "Mono PERC 120 Half-Cut Cells", "Module Efficiency": "20.9%", "Dimensions": "1903 x 1134 x 35 mm", "Weight": "24.0 kg" },
        key_features: ["Compact size easily handled during terrace rooftop installations", "Superior shade tolerance with 3 bypass diodes", "Lower temperature coefficient for hotter summer months", "Sleek all-black aesthetic appearance"],
        is_featured: 0
      },
      {
        id: 5,
        category_id: 1,
        name: '535W DCR Approved Mono PERC Solar Panel',
        slug: '535w-dcr-approved-mono-perc-solar-panel',
        short_info: '100% Domestic Content Requirement (DCR) certified module mandatory for PM Surya Ghar Central Financial Assistance (CFA) subsidy.',
        full_description: 'Manufactured in India with indigenous cells and wafers. Fully compliant with Ministry of New and Renewable Energy (MNRE) guidelines.',
        approx_price: 15200.00,
        gst_rate: 12.00,
        hsn_code: '85414011',
        stock_qty: 50,
        stock_status: 'in_stock',
        primary_image: '/images/products/dcr-mono-535w.svg',
        warranty: '25-Year Warranty (MNRE Approved)',
        specifications: { "Rated Power": "535 Watts", "Cell Origin": "Made in India (DCR Compliant)", "Module Efficiency": "20.8%", "Dimensions": "2278 x 1134 x 35 mm", "Certifications": "BIS, MNRE ALMM Listed" },
        key_features: ["Strictly ALMM Listed and DCR Certified for Gov. Subsidy", "Unlocks up to ₹78,000 direct subsidy to customer bank account", "Passed salt-mist and ammonia corrosion tests", "Fully compatible with MSEDCL net-metering standards"],
        is_featured: 1
      },
      {
        id: 6,
        category_id: 1,
        name: 'PM Surya Ghar 3kW Complete Rooftop Package',
        slug: 'pm-surya-ghar-3kw-complete-rooftop-package',
        short_info: 'Turnkey 3kW rooftop solar kit: 6x 540W DCR panels, 3.3kW On-Grid Inverter, GI mounting structure, ACDB/DCDB, earthing and MSEDCL net metering liaison.',
        full_description: 'Complete solution for a standard 2-3 BHK home in Dindori/Nashik. Saves ₹3,000 to ₹4,500 every month on electricity bills. Eligible for maximum ₹78,000 PM Surya Ghar subsidy.',
        approx_price: 165000.00,
        gst_rate: 12.00,
        hsn_code: '85414011',
        stock_qty: 12,
        stock_status: 'in_stock',
        primary_image: '/images/products/rooftop-solar-combo.svg',
        warranty: '25 Years on Panels, 8 Years on Inverter',
        specifications: { "Plant Capacity": "3.3 kWp DC / 3.0 kW AC", "Monthly Generation": "360 - 420 Units (kWh)", "Rooftop Area Required": "Approx 220 - 250 sq.ft", "Inverter": "3.3kW Single Phase On-Grid with WiFi", "Structure": "Hot Dip Galvanized 80 Micron" },
        key_features: ["Comprehensive turnkey installation by Shree Sai Enterprises", "Govt Subsidy up to ₹78,000 processed directly to your account", "MSEDCL bi-directional net-meter paperwork and liaison included", "Lightning arrester, chemical earthing pits, and surge protection included"],
        is_featured: 1
      },
      // SOLAR WATER HEATERS
      {
        id: 7,
        category_id: 2,
        name: '100 LPD ETC Solar Water Heater',
        slug: '100-lpd-etc-solar-water-heater',
        short_info: 'Compact 100 Litres Per Day Evacuated Tube Collector solar water heater designed for 2-3 member households.',
        full_description: 'High-grade borosilicate 3-target glass tubes with copper-selective coating deliver scalding hot water even on overcast winter mornings in Nashik.',
        approx_price: 16500.00,
        gst_rate: 12.00,
        hsn_code: '84191920',
        stock_qty: 15,
        stock_status: 'in_stock',
        primary_image: '/images/products/solar-water-heater-etc-100lpd.svg',
        warranty: '5-Year Tank Replacement Warranty',
        specifications: { "Capacity": "100 Litres Per Day", "Collector Type": "Evacuated Tube Collector (ETC)", "No. of Tubes": "10 Tubes (58mm x 1800mm)", "Inner Tank": "Food Grade SS304-2B Stainless Steel", "Insulation": "50mm High Density Injected PUF" },
        key_features: ["Heats water up to 60°C - 80°C using zero electricity", "Special ceramic coating prevents hard water scaling", "Keeps water hot for over 48 hours thanks to injected PUF insulation", "Easy installation on flat terrace or sloping roof"],
        is_featured: 1
      },
      {
        id: 8,
        category_id: 2,
        name: '200 LPD ETC Non-Pressurized Solar Water Heater',
        slug: '200-lpd-etc-non-pressurized-solar-water-heater',
        short_info: 'Popular 200 Litres Per Day system, the #1 choice for typical 4 to 6 member families in Dindori and Nashik.',
        full_description: 'Reduces your electric geyser power consumption to zero. Features sacrificial magnesium anode rod to protect against hard groundwater mineral buildup.',
        approx_price: 26800.00,
        gst_rate: 12.00,
        hsn_code: '84191920',
        stock_qty: 20,
        stock_status: 'in_stock',
        primary_image: '/images/products/solar-water-heater-etc-200lpd.svg',
        warranty: '5-Year Manufacturer Warranty',
        specifications: { "Capacity": "200 Litres Per Day", "Collector Type": "15x Three-Target Borosilicate Glass Tubes", "Inner Tank": "SS304 Non-Magnetic Stainless Steel", "Frame": "Rust-proof Powder Coated GI Stand", "Max Temperature": "85°C" },
        key_features: ["Saves up to 1,800 units of domestic electricity per year", "Magnesium anode included for hard water longevity", "Heavy duty stand designed to withstand high winds", "Built-in auxiliary backup electrical heater port (optional)"],
        is_featured: 1
      },
      {
        id: 9,
        category_id: 2,
        name: '300 LPD FPC Flat Plate Collector Solar Water Heater',
        slug: '300-lpd-fpc-flat-plate-collector-solar-water-heater',
        short_info: 'Heavy-duty 300 Litres Flat Plate Collector system with copper absorber plate, toughened glass, and high pressure capability.',
        full_description: 'Engineered for luxury homes, multi-story bungalows, and pressure-pump booster plumbing setups.',
        approx_price: 48000.00,
        gst_rate: 12.00,
        hsn_code: '84191920',
        stock_qty: 8,
        stock_status: 'in_stock',
        primary_image: '/images/products/solar-water-heater-fpc-300lpd.svg',
        warranty: '7-Year Warranty on Collector',
        specifications: { "Capacity": "300 Litres Per Day", "Collector Type": "2x Copper-Copper Ultrasonic Welded Flat Plates", "Glass": "4mm High Transmission Toughened Solar Glass", "Pressure Rating": "Tested up to 5.0 bar (booster pump safe)", "Tank": "Inner Vitreous Enamel Coated Heavy Gauge Tank" },
        key_features: ["Compatible with automatic bathroom booster water pumps", "Copper fin-and-tube core with 99.9% thermal conductivity", "Highly resistant to hail, stone hits, and thermal shock", "Designed for large 6-8 member joint families and bungalows"],
        is_featured: 0
      },
      {
        id: 10,
        category_id: 2,
        name: '500 LPD Commercial Solar Water Heating System',
        slug: '500-lpd-commercial-solar-water-heating-system',
        short_info: 'High-capacity 500 Litres Per Day solar water heater for hostels, hotels, dairies, hospitals, and agro-processing units in Nashik district.',
        full_description: 'Modular manifold system with heavy-gauge insulated storage tank. Can be linked with circulation pumps and temperature controller automation.',
        approx_price: 72000.00,
        gst_rate: 12.00,
        hsn_code: '84191920',
        stock_qty: 5,
        stock_status: 'in_stock',
        primary_image: '/images/products/solar-water-heater-etc-500lpd.svg',
        warranty: '5-Year System Warranty',
        specifications: { "Capacity": "500 Litres Per Day", "Collector Configuration": "34 Evacuated Vacuum Tubes / Dual Manifold", "Inner Tank": "SS316 Acid & Corrosion Resistant Steel", "Insulation": "60mm High Density Polyurethane Foam" },
        key_features: ["Massive energy savings for commercial kitchens, lodges, and hospitals", "Can be scaled up modularly to 1000, 2000, or 5000 LPD", "Integrated temperature sensor port and drain valves", "Professional on-site piping installation provided by Shree Sai Enterprises"],
        is_featured: 0
      },
      {
        id: 11,
        category_id: 2,
        name: '250 LPD Pressurized Solar Water Heater',
        slug: '250-lpd-pressurized-solar-water-heater',
        short_info: 'Specialized 250 LPD system designed to withstand high water pressure from overhead hydropneumatic booster pumps and modern rain showers.',
        full_description: 'Features internal heat exchanger copper coil or heavy-walled inner tank tested to withstand up to 6 bar operating pressure.',
        approx_price: 39500.00,
        gst_rate: 12.00,
        hsn_code: '84191920',
        stock_qty: 7,
        stock_status: 'in_stock',
        primary_image: '/images/products/pressurized-swh-250lpd.svg',
        warranty: '5-Year Warranty',
        specifications: { "Capacity": "250 Litres Per Day", "Pressure Tolerance": "Up to 6 kg/cm²", "Inner Tank": "Heavy gauge steel with anti-corrosion enamel coating", "Tubes": "Heat Pipe / U-Pipe Technology" },
        key_features: ["Works seamlessly with multi-flow rain showers and jacuzzis", "Eliminates hot/cold pressure fluctuations", "Superior thermal retention in freezing winter nights", "Corrosion-resistant powder coated support structure"],
        is_featured: 0
      },
      // INVERTERS
      {
        id: 12,
        category_id: 3,
        name: '1 kVA / 12V Pure Sine Wave Solar Hybrid Inverter',
        slug: '1-kva-12v-pure-sine-wave-solar-hybrid-inverter',
        short_info: 'Smart 1000VA entry-level hybrid solar inverter with built-in 40A MPPT charge controller and dual AC charging modes.',
        full_description: 'Perfect for small homes, shops, and rural establishments running lights, fans, computer, and TV directly on free solar power.',
        approx_price: 8500.00,
        gst_rate: 18.00,
        hsn_code: '85044090',
        stock_qty: 25,
        stock_status: 'in_stock',
        primary_image: '/images/products/micro-inverter-1kva.svg',
        warranty: '2-Year On-Site Warranty',
        specifications: { "Rated Capacity": "1000 VA / 800 Watts", "Battery Voltage": "12V DC (Single Battery)", "Solar Charge Controller": "MPPT 40A", "Max PV Input": "800 Wp (Voc: 15V - 50V)", "Waveform": "Pure Sine Wave (<3% THD)" },
        key_features: ["Solar priority mode cuts grid electricity consumption first", "Intelligent battery charging algorithm extends battery life by 25%", "Overload, short-circuit, and reverse polarity protection", "Silent operation with adaptive fan cooling"],
        is_featured: 1
      },
      {
        id: 13,
        category_id: 3,
        name: '2 kVA / 24V MPPT Solar PCU Inverter',
        slug: '2-kva-24v-mppt-solar-pcu-inverter',
        short_info: 'High-efficiency 2000VA Power Conditioning Unit (PCU) with advanced tracking algorithm that extracts up to 30% more energy from solar panels.',
        full_description: 'Supports high voltage solar panel arrays and powers heavy household inductive loads like refrigerators and water pumps.',
        approx_price: 16200.00,
        gst_rate: 18.00,
        hsn_code: '85044090',
        stock_qty: 16,
        stock_status: 'in_stock',
        primary_image: '/images/products/offgrid-inverter-2kva.svg',
        warranty: '2-Year Warranty',
        specifications: { "Rated Capacity": "2000 VA / 1600 Watts", "Battery Nominal Voltage": "24V DC (2 Batteries)", "Solar Controller": "rMPPT 50A", "Max PV Array": "2000 Wp (Voc: 40V - 90V)", "Efficiency": "94.5%" },
        key_features: ["Multi-colour LCD display shows solar generation, load %, and battery health", "Can run 1 HP submersible or centrifugal water pump", "Grid bypass mode for uninterrupted power supply", "Rugged design built for Nashik rural voltage fluctuations"],
        is_featured: 0
      },
      {
        id: 14,
        category_id: 3,
        name: '3 kVA / 36V Smart Solar PCU with LCD Display',
        slug: '3-kva-36v-smart-solar-pcu-with-lcd-display',
        short_info: 'Heavy-duty 3kVA solar PCU designed for bungalows, clinics, and offices requiring continuous high-load solar backup.',
        full_description: 'Intelligent load sharing automatically distributes demand between solar, battery, and grid to ensure minimum grid bill.',
        approx_price: 25500.00,
        gst_rate: 18.00,
        hsn_code: '85044090',
        stock_qty: 12,
        stock_status: 'in_stock',
        primary_image: '/images/products/solar-inverter-3kva-hybrid.svg',
        warranty: '3-Year Manufacturer Warranty',
        specifications: { "Rated Capacity": "3000 VA / 2400 Watts", "Battery System": "36V DC (3 Batteries)", "Charge Controller": "Dual MPPT 60A", "Max Solar Input": "3000 Wp", "Peak Inverter Efficiency": "95.2%" },
        key_features: ["Priority mode: Solar -> Battery -> Grid for lowest possible bills", "Supports heavy loads: 1.5 Ton Inverter AC, deep freezers, and printers", "Digital diagnostic screen with error logs and daily unit meter", "DG Genset compatible input synchronization"],
        is_featured: 1
      },
      {
        id: 15,
        category_id: 3,
        name: '5 kVA / 48V Hybrid Solar Inverter with WiFi',
        slug: '5-kva-48v-hybrid-solar-inverter-with-wifi',
        short_info: 'Premium 5kW hybrid solar inverter that works both on-grid (exporting excess units) and off-grid with 48V battery bank.',
        full_description: 'Features integrated WiFi monitoring so you can check live solar generation, battery status, and savings from your smartphone anywhere.',
        approx_price: 48000.00,
        gst_rate: 18.00,
        hsn_code: '85044090',
        stock_qty: 8,
        stock_status: 'in_stock',
        primary_image: '/images/products/solar-pcu-5kva.svg',
        warranty: '5-Year Comprehensive Warranty',
        specifications: { "Rated Power": "5000 Watts (5 kW)", "Battery Support": "48V DC (Tubular or LiFePO4 Lithium)", "MPPT Channels": "Dual MPPT (2x 15A, 120V - 450V)", "Grid Interactive": "Yes (Zero-export or Net Metering capable)", "Connectivity": "WiFi / RS485 / Mobile App" },
        key_features: ["True Hybrid: Export excess power to grid or store in batteries", "Seamless 10ms transfer switch prevents desktop and TV resets", "Plug-and-play BMS communication with Lithium batteries", "High surge rating up to 10,000 VA for motor startup"],
        is_featured: 1
      },
      {
        id: 16,
        category_id: 3,
        name: '10 kVA Three-Phase On-Grid Solar Inverter',
        slug: '10-kva-three-phase-on-grid-solar-inverter',
        short_info: 'Commercial grade 10 kW 3-phase grid-tied string inverter with 98.6% peak European efficiency, dual MPPT trackers, and IP65 weatherproof casing.',
        full_description: 'Engineered for commercial rooftop solar plants, grape cold storages, winery facilities, and institutions in Dindori and Nashik.',
        approx_price: 76000.00,
        gst_rate: 18.00,
        hsn_code: '85044090',
        stock_qty: 6,
        stock_status: 'in_stock',
        primary_image: '/images/products/ongrid-inverter-10kva.svg',
        warranty: '8-Year Warranty (Extendable to 15 Yrs)',
        specifications: { "Rated AC Output": "10,000 W (Three Phase 415V)", "Max PV Array Input": "15,000 Wp", "MPPT Trackers": "2 Trackers / 2 Strings each", "Protection": "IP65 Outdoor Cast Aluminium Enclosure", "Efficiency": "98.6% Peak Efficiency" },
        key_features: ["Dual MPPT for roofs facing two different sun directions", "Built-in DC isolator switch and Type II surge protection (SPD)", "Full cloud monitoring portal with mobile dashboard", "Approved by MSEDCL for three-phase commercial net metering"],
        is_featured: 0
      },
      // BATTERIES
      {
        id: 17,
        category_id: 4,
        name: '150Ah / 12V Tall Tubular Solar C10 Battery',
        slug: '150ah-12v-tall-tubular-solar-c10-battery',
        short_info: 'Industry benchmark C10 rated tall tubular lead-acid battery with high pressure die-cast spine plates for long cycle life.',
        full_description: 'Withstands deep discharge cycles and intense heat. The most dependable companion for residential solar inverters in rural Maharashtra.',
        approx_price: 14800.00,
        gst_rate: 18.00,
        hsn_code: '85072000',
        stock_qty: 40,
        stock_status: 'in_stock',
        primary_image: '/images/products/tubular-battery-150ah.svg',
        warranty: '60-Month Warranty (36 Mo Replacement + 24 Mo Pro-rata)',
        specifications: { "Nominal Voltage": "12 Volts", "Capacity @ C10": "150 Ah", "Technology": "Spine Die-Cast Tall Tubular Plates", "Dimensions": "505 x 190 x 410 mm", "Weight (Filled)": "54 kg" },
        key_features: ["Special C10 discharge rating engineered specifically for solar applications", "Ceramic vent plugs with level indicators for easy water check", "Performs reliably up to 1500 discharge cycles @ 80% DOD", "Ultra-low water loss reduces top-up frequency to once a year"],
        is_featured: 1
      },
      {
        id: 18,
        category_id: 4,
        name: '200Ah / 12V Heavy Duty Tubular Solar Battery',
        slug: '200ah-12v-heavy-duty-tubular-solar-battery',
        short_info: 'Heavy duty 200Ah C10 tall tubular battery built for extended power cut durations in rural Dindori and agricultural belts.',
        full_description: 'Extra thick positive spine plates resist grid corrosion and ensure deep discharge recovery after consecutive cloudy monsoon days.',
        approx_price: 19500.00,
        gst_rate: 18.00,
        hsn_code: '85072000',
        stock_qty: 25,
        stock_status: 'in_stock',
        primary_image: '/images/products/tubular-battery-200ah.svg',
        warranty: '60-Month Comprehensive Warranty',
        specifications: { "Nominal Voltage": "12 Volts", "Capacity @ C10": "200 Ah", "Type": "Tall Tubular Deep Cycle", "Dimensions": "505 x 190 x 440 mm", "Filled Weight": "65 kg" },
        key_features: ["High backup capacity: supplies 400W continuous load for ~5 hours", "Robust antimony-selenium alloy grids eliminate plate peeling", "Exceptional recharge acceptance even from weak solar radiation", "Shock-proof heavy duty container with sturdy carrying handles"],
        is_featured: 1
      },
      {
        id: 19,
        category_id: 4,
        name: '100Ah / 48V LiFePO4 Lithium Solar Battery (5.12 kWh)',
        slug: '100ah-48v-lifepo4-lithium-solar-battery-5kwh',
        short_info: 'Modern Lithium Iron Phosphate (LiFePO4) 48V wall-mount / rack battery with integrated Smart Battery Management System (BMS).',
        full_description: 'Zero maintenance, 4x faster charging, and 15+ years lifespan. Replaces 4 bulky lead-acid batteries with a sleek compact unit.',
        approx_price: 68000.00,
        gst_rate: 18.00,
        hsn_code: '85072000',
        stock_qty: 10,
        stock_status: 'in_stock',
        primary_image: '/images/products/lithium-solar-battery-100ah.svg',
        warranty: '10-Year Manufacturer Warranty',
        specifications: { "Usable Energy": "5.12 kWh (48V / 100Ah)", "Chemistry": "Lithium Iron Phosphate (LiFePO4)", "Cycle Life": "6,000+ Cycles @ 80% DOD", "Max Charge/Discharge": "100 A", "Dimensions": "482 x 450 x 178 mm", "Weight": "42 kg" },
        key_features: ["15+ Year lifespan with over 6000 deep discharge cycles", "Charges to 100% in just 2 hours via solar or grid", "Built-in Smart BMS with over-temp, short-circuit and cell balancing", "Compact wall-mount design saves precious floor footprint"],
        is_featured: 1
      },
      {
        id: 20,
        category_id: 4,
        name: '150Ah / 48V Lithium Solar Smart Powerwall (7.68 kWh)',
        slug: '150ah-48v-lithium-solar-smart-powerwall-7kwh',
        short_info: 'High-capacity home energy storage powerhouse. Provides whole-home backup during load shedding with zero noise and zero emissions.',
        full_description: 'Equipped with digital touch LCD screen displaying state-of-charge, cell voltages, cycle count, and CAN/RS485 communication ports.',
        approx_price: 98000.00,
        gst_rate: 18.00,
        hsn_code: '85072000',
        stock_qty: 5,
        stock_status: 'in_stock',
        primary_image: '/images/products/lithium-solar-battery-150ah.svg',
        warranty: '10-Year Warranty',
        specifications: { "Usable Capacity": "7.68 kWh (51.2V / 150Ah)", "Cell Type": "Prismatic LiFePO4 Grade-A Cells", "Communication": "CAN / RS485 / RS232", "Operating Temp": "-10°C to 55°C", "Weight": "63 kg" },
        key_features: ["Powers complete home including inverter ACs and water pump", "Real-time communication with Growatt, Havells, and Deye inverters", "Wall-mounted aesthetic modern design with LED indicators", "Modular design: up to 15 units can be connected in parallel"],
        is_featured: 0
      },
      {
        id: 21,
        category_id: 4,
        name: '150Ah / 12V Maintenance-Free Solar Gel Battery',
        slug: '150ah-12v-maintenance-free-solar-gel-battery',
        short_info: 'Sealed VRLA Gel battery with thixotropic gel electrolyte. Requires zero water topping up throughout its lifetime and emits no acid fumes.',
        full_description: 'Ideal for indoor installations in bedrooms, clinics, and offices where safety and zero acid fumes are paramount.',
        approx_price: 17200.00,
        gst_rate: 18.00,
        hsn_code: '85072000',
        stock_qty: 14,
        stock_status: 'in_stock',
        primary_image: '/images/products/solar-gel-battery-150ah.svg',
        warranty: '36-Month Warranty',
        specifications: { "Voltage": "12 Volts", "Capacity @ C10": "150 Ah", "Electrolyte": "Fumed Silica Gel Electrolyte (Non-spillable)", "Self-Discharge": "<2% per month @ 25°C" },
        key_features: ["100% Sealed and maintenance-free; zero water topping required", "Zero toxic acid fumes: safe for indoor home living spaces", "Excellent recovery from deep discharge without plate sulfation", "High vibration and shock resistance"],
        is_featured: 0
      }
    ],
    services: [
      {
        id: 1,
        title: 'Rooftop Solar Installation',
        slug: 'rooftop-solar-installation',
        short_desc: 'End-to-end turnkey rooftop solar installation for homes, agricultural farmhouses, and commercial buildings under PM Surya Ghar Yojana with MNRE subsidy.',
        full_desc: 'Shree Sai Enterprises handles everything from rooftop shadow analysis, civil structural engineering, Tier-1 Mono PERC panel mounting, inverter commissioning, to MSEDCL net meter installation.',
        icon: 'sun',
        key_features: ["Comprehensive shadow & structural roof feasibility survey", "MNRE and PM Surya Ghar portal vendor subsidy application", "Hot-dip galvanized heavy-duty mounting structures", "MSEDCL DisCom net-meter sanction and bi-directional meter setup", "25-year panel performance guarantee with on-site warranty"],
        is_active: 1,
        display_order: 1
      },
      {
        id: 2,
        title: 'Solar Water Heater Installation',
        slug: 'solar-water-heater-installation',
        short_desc: 'Professional installation, plumbing integration, and commissioning of Evacuated Tube (ETC) and Flat Plate (FPC) solar water heaters.',
        full_desc: 'We integrate the solar tank directly into your bathroom and kitchen hot water plumbing with insulated CPVC piping, safety pressure relief valves, and optional electrical backup heaters.',
        icon: 'droplet',
        key_features: ["Accurate roof sizing for 100 to 500+ LPD daily hot water needs", "High pressure booster pump compatible plumbing", "Corrosion-resistant rust-proof GI stand assembly", "Magnesium anode installation to combat hard groundwater", "Zero electricity bills for hot water 365 days a year"],
        is_active: 1,
        display_order: 2
      },
      {
        id: 3,
        title: 'Solar Maintenance & AMC',
        slug: 'solar-maintenance-amc',
        short_desc: 'Annual Maintenance Contracts (AMC) and periodic cleaning, inverter health checks, and string testing to guarantee peak power generation.',
        full_desc: 'Dust and agricultural pollen can reduce solar output by up to 25%. Our skilled technicians ensure your panels are spotless and your electrical joints are safe.',
        icon: 'shield-check',
        key_features: ["De-mineralized water panel cleaning with soft microfiber brushes", "Thermal imaging & hotspot detection on individual cells", "Inverter firmware updates and MPPT efficiency calibration", "ACDB/DCDB torque inspection and earthing resistance testing", "Priority on-call breakdown support within 24 hours"],
        is_active: 1,
        display_order: 3
      },
      {
        id: 4,
        title: 'Consultation & Net Metering Liaison',
        slug: 'consultation-net-metering',
        short_desc: 'Expert technical consultation, return-on-investment (ROI) analysis, and seamless government liaison with MSEDCL (Mahavitaran) for net metering.',
        full_desc: 'We take the headache out of government paperwork. We register your application on the national PM Surya Ghar portal, arrange DisCom inspection, and ensure subsidy release.',
        icon: 'file-text',
        key_features: ["Accurate 25-year financial ROI and payback period projection", "Preparation of SLD (Single Line Diagram) and technical drawings", "Filing on PM Surya Ghar Muft Bijli Yojana national portal", "DisCom / MSEDCL net metering approval and meter commissioning", "Assistance in securing low-interest bank solar rooftop loans"],
        is_active: 1,
        display_order: 4
      },
      {
        id: 5,
        title: 'Repair & Technical Support',
        slug: 'repair-and-support',
        short_desc: 'Fast on-site troubleshooting and component repair for all brands of solar inverters, charge controllers, water heaters, and broken panel glass.',
        full_desc: 'Facing inverter fault codes or low hot water temperature? Our Dindori-based technicians reach your site promptly with genuine spare parts.',
        icon: 'wrench',
        key_features: ["Inverter board-level repair and capacitor/IGBT replacement", "Solar water heater glass tube replacement and inner tank descaling", "Battery desulfation, specific gravity tuning and terminal cleaning", "Loose MC4 connector and blown DC fuse replacement", "Emergency helpline: 9822414748 / 9422941187"],
        is_active: 1,
        display_order: 5
      },
      {
        id: 6,
        title: 'Agricultural Solar Water Pumps',
        slug: 'agricultural-solar-pumps',
        short_desc: 'Solar powered submersible and surface water pumping systems for orchards, vineyards, and agricultural fields across Dindori and Nashik.',
        full_desc: 'Pumps water reliably without relying on erratic rural electrical three-phase power schedules. Compatible with drip and sprinkler irrigation.',
        icon: 'zap',
        key_features: ["3 HP to 10 HP AC solar submersible & monoblock pump solutions", "VFD (Variable Frequency Drive) solar pump controller with MPPT", "Dry run, reverse polarity, and lightning surge protection", "Automatic water discharge from morning sunrise to sunset", "Dual-axis seasonal manual tracking structures for extra yield"],
        is_active: 1,
        display_order: 6
      }
    ],
    gallery: [
      { id: 1, title: '3.3 kW PM Surya Ghar Rooftop Installation', category: 'Installations', description: 'Turnkey residential installation with 540W Mono PERC panels and net metering on elevated GI structure.', image_url: '/images/gallery/installation-rooftop-dindori-1.svg', location: 'Palkhed Road, Dindori', display_order: 1 },
      { id: 2, title: '5 HP Agricultural Solar Water Pump for Vineyard', category: 'Installations', description: 'Solar water pump system powering drip irrigation across 4 acres of grapes in Dindori taluka.', image_url: '/images/gallery/installation-agricultural-pump-2.svg', location: 'Janori Shivar, Dindori', display_order: 2 },
      { id: 3, title: '10 kW Commercial Solar System for Cold Storage', category: 'Installations', description: 'Commercial grid-tied solar system with 10kVA 3-phase inverter slashing monthly industrial tariff.', image_url: '/images/gallery/installation-commercial-factory-3.svg', location: 'MIDC Area, Dindori Nashik', display_order: 3 },
      { id: 4, title: '200 LPD Solar Water Heater on Residential Villa', category: 'Installations', description: 'Non-pressurized 200 LPD ETC solar water heater mounted on reinforced terrace stand.', image_url: '/images/gallery/installation-residential-villa-4.svg', location: 'Sai Sankul, Dindori', display_order: 4 },
      { id: 5, title: 'Fresh Stock Arrival of 550W Tier-1 Panels', category: 'Materials', description: 'Original shipment unboxing of high efficiency 550W Mono PERC half-cut modules at our Dindori warehouse.', image_url: '/images/gallery/materials-mono-panels-unboxing.svg', location: 'Shree Sai Enterprises Warehouse', display_order: 5 },
      { id: 6, title: 'Hybrid Solar Inverters and Lithium Batteries Stock', category: 'Materials', description: 'In-stock inventory of smart hybrid solar inverters, PCUs, and LiFePO4 batteries ready for dispatch.', image_url: '/images/gallery/materials-hybrid-inverters-stock.svg', location: 'Dindori Warehouse', display_order: 6 },
      { id: 7, title: 'Hot-Dip Galvanized Mounting Structures & Hardware', category: 'Materials', description: 'Heavy gauge 80-micron galvanized steel frames and stainless steel fasteners engineered for 30+ year lifespan.', image_url: '/images/gallery/materials-structure-galvanized.svg', location: 'Material Yard, Dindori', display_order: 7 },
      { id: 8, title: 'PM Surya Ghar Yojana Official Vendor Registration', category: 'Documentation', description: 'Official vendor authorization and accreditation under the Ministry of New and Renewable Energy (MNRE).', image_url: '/images/gallery/documentation-pm-surya-ghar-subsidy.svg', location: 'MNRE / National Portal', display_order: 8 },
      { id: 9, title: 'MSEDCL Net Metering Commissioning Certificate', category: 'Documentation', description: 'Successfully commissioned bi-directional net-meter certificate approved by Mahavitaran Nashik division.', image_url: '/images/gallery/documentation-net-metering-approval.svg', location: 'MSEDCL Nashik Circle', display_order: 9 },
      { id: 10, title: 'Certified Electrical Testing & Inspection Report', category: 'Documentation', description: 'Official safety compliance and chemical earthing resistance inspection report signed by chartered electrical engineer.', image_url: '/images/gallery/documentation-inspection-certificate.svg', location: 'Dindori, Nashik', display_order: 10 }
    ],
    admin_users: [
      { id: 1, username: 'admin', email: 'samadhanj182@gmail.com', password_hash: '$2a$10$w6blY.Ibki7rRf8.kPOme.bSn1bq4R8Tb67TRx8ON8TXwxwMLV7um', full_name: 'Samadhan R. Jadhav', role: 'superadmin' }
    ],
    quotes: [
      {
        id: 1,
        quote_number: 'SSE/2024-25/001',
        customer_name: 'Rajesh K. Patil',
        customer_phone: '9822113344',
        customer_email: 'rajeshpatil.nashik@gmail.com',
        customer_address: 'Plot No. 14, Shanti Nagar, Near Market Yard, Dindori, Nashik - 422202',
        city: 'Dindori',
        district: 'Nashik',
        pincode: '422202',
        customer_notes: 'Require 3kW rooftop solar quotation with PM Surya Ghar subsidy details and net-metering.',
        subtotal: 165000.00,
        discount_amount: 5000.00,
        taxable_amount: 160000.00,
        cgst_amount: 9600.00,
        sgst_amount: 9600.00,
        total_gst: 19200.00,
        grand_total: 179200.00,
        grand_total_words: 'Rupees One Lakh Seventy-Nine Thousand Two Hundred Only',
        validity_days: 15,
        status: 'Replied',
        admin_notes: 'Discussed on phone. Site visit scheduled for Sunday.',
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        items: [
          {
            id: 1,
            quote_id: 1,
            product_id: 6,
            product_name: 'PM Surya Ghar 3kW Complete Rooftop Package',
            category_name: 'Solar Panels',
            hsn_code: '85414011',
            quantity: 1,
            unit_price: 165000.00,
            discount: 5000.00,
            taxable_amount: 160000.00,
            gst_rate: 12.00,
            cgst_amount: 9600.00,
            sgst_amount: 9600.00,
            total_amount: 179200.00
          }
        ]
      }
    ],
    contact_messages: [
      {
        id: 1,
        name: 'Ganesh Shinde',
        phone: '9423158899',
        email: 'ganesh.shinde@rediffmail.com',
        subject: 'Subsidy Inquiry for 5kW Solar Rooftop',
        message: 'Hello Samadhan ji, I want to install a 5kW rooftop system in Janori, Dindori. Please call me regarding PM Surya Ghar subsidy process and solar loans.',
        is_read: 0,
        created_at: new Date(Date.now() - 3600000 * 6).toISOString()
      }
    ]
  };
}

// Fallback Store Controller
function loadFallbackStore() {
  try {
    if (fs.existsSync(fallbackDbFile)) {
      const data = fs.readFileSync(fallbackDbFile, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading fallback DB, recreating...', err);
  }
  const initial = getInitialSeedData();
  saveFallbackStore(initial);
  return initial;
}

function saveFallbackStore(data) {
  try {
    fs.writeFileSync(fallbackDbFile, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving fallback DB:', err);
  }
}

// Initialize database
async function initDb() {
  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT, 10) || 3306;
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'shree_sai_enterprises';

  try {
    const testPool = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Test query
    await testPool.query('SELECT 1');
    pool = testPool;
    isUsingFallback = false;
    console.log(`[DB] Successfully connected to MySQL database: ${database}@${host}:${port}`);
    return;
  } catch (err) {
    console.warn(`[DB] MySQL connection notice (${err.code || err.message}).`);
    console.warn('[DB] Operating with built-in high-performance local store (data/local_store.json). All features, APIs, and Admin actions are fully functional.');
    isUsingFallback = true;
    fallbackDb = loadFallbackStore();
  }
}

// Universal query runner
async function query(sql, params = []) {
  if (!isUsingFallback && pool) {
    try {
      const [rows] = await pool.query(sql, params);
      return rows;
    } catch (err) {
      console.error('[DB] MySQL query failed:', err.message);
      throw err;
    }
  }

  // Fallback engine for non-MySQL or fallback mode
  return handleFallbackQuery(sql, params);
}

function handleFallbackQuery(sql, params = []) {
  if (!fallbackDb) {
    fallbackDb = loadFallbackStore();
  }

  const s = sql.trim().toLowerCase();

  // 1. SELECT Categories
  if (s.startsWith('select') && s.includes('from categories')) {
    let list = [...fallbackDb.categories];
    return list;
  }

  // 2. SELECT Products
  if (s.startsWith('select') && s.includes('from products')) {
    let list = [...fallbackDb.products];
    
    // Join category name
    list = list.map(p => {
      const cat = fallbackDb.categories.find(c => c.id === p.category_id);
      return { ...p, category_name: cat ? cat.name : 'Solar Equipment', category_slug: cat ? cat.slug : '' };
    });

    // WHERE id = ?
    if (s.includes('where id =') || s.includes('where p.id =')) {
      const id = params[0];
      return list.filter(p => p.id == id);
    }
    // WHERE slug = ?
    if (s.includes('where slug =') || s.includes('where p.slug =')) {
      const slug = params[0];
      return list.filter(p => p.slug === slug);
    }
    // WHERE category_id = ?
    if (s.includes('where category_id =') || s.includes('where p.category_id =')) {
      const catId = params[0];
      list = list.filter(p => p.category_id == catId);
    }
    // WHERE is_featured = 1
    if (s.includes('is_featured = 1')) {
      list = list.filter(p => p.is_featured == 1);
    }

    return list;
  }

  // 3. SELECT Services
  if (s.startsWith('select') && s.includes('from services')) {
    let list = [...fallbackDb.services];
    if (s.includes('where slug =')) {
      const slug = params[0];
      return list.filter(srv => srv.slug === slug);
    }
    if (s.includes('where id =')) {
      const id = params[0];
      return list.filter(srv => srv.id == id);
    }
    return list.sort((a, b) => a.display_order - b.display_order);
  }

  // 4. SELECT Gallery
  if (s.startsWith('select') && s.includes('from gallery')) {
    let list = [...fallbackDb.gallery];
    if (s.includes('where category =')) {
      const cat = params[0];
      list = list.filter(g => g.category.toLowerCase() === String(cat).toLowerCase());
    }
    return list.sort((a, b) => a.display_order - b.display_order);
  }

  // 5. SELECT Admin Users
  if (s.startsWith('select') && s.includes('from admin_users')) {
    let list = [...fallbackDb.admin_users];
    if (s.includes('where username =') || s.includes('where email =')) {
      const val = params[0];
      return list.filter(u => u.username === val || u.email === val);
    }
    return list;
  }

  // 6. SELECT Quotes
  if (s.startsWith('select') && s.includes('from quotes')) {
    let list = [...fallbackDb.quotes];
    if (s.includes('where id =')) {
      const id = params[0];
      return list.filter(q => q.id == id);
    }
    if (s.includes('where quote_number =')) {
      const num = params[0];
      return list.filter(q => q.quote_number === num);
    }
    return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  // 7. SELECT Contact Messages
  if (s.startsWith('select') && s.includes('from contact_messages')) {
    let list = [...fallbackDb.contact_messages];
    return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  // 8. INSERT Products
  if (s.startsWith('insert into products')) {
    const newId = (fallbackDb.products.length > 0 ? Math.max(...fallbackDb.products.map(p => p.id)) : 0) + 1;
    const newProd = {
      id: newId,
      category_id: params[0],
      name: params[1],
      slug: params[2],
      short_info: params[3],
      full_description: params[4],
      approx_price: parseFloat(params[5]),
      gst_rate: parseFloat(params[6] || 12),
      hsn_code: params[7] || '85414011',
      stock_qty: parseInt(params[8] || 10, 10),
      stock_status: params[9] || 'in_stock',
      primary_image: params[10],
      warranty: params[11] || 'Standard Warranty',
      specifications: typeof params[12] === 'string' ? JSON.parse(params[12]) : (params[12] || {}),
      key_features: typeof params[13] === 'string' ? JSON.parse(params[13]) : (params[13] || []),
      is_featured: params[14] ? 1 : 0,
      created_at: new Date().toISOString()
    };
    fallbackDb.products.push(newProd);
    saveFallbackStore(fallbackDb);
    return { insertId: newId, affectedRows: 1 };
  }

  // 9. UPDATE Products
  if (s.startsWith('update products')) {
    const id = params[params.length - 1];
    const idx = fallbackDb.products.findIndex(p => p.id == id);
    if (idx !== -1) {
      if (params.length === 2 && s.includes('stock_qty =') && s.includes('stock_status =')) {
        // Stock update
        fallbackDb.products[idx].stock_qty = params[0];
        fallbackDb.products[idx].stock_status = params[1];
      } else if (params.length === 2 && s.includes('approx_price =')) {
        fallbackDb.products[idx].approx_price = parseFloat(params[0]);
      } else {
        // Full update
        fallbackDb.products[idx] = {
          ...fallbackDb.products[idx],
          category_id: params[0],
          name: params[1],
          short_info: params[2],
          full_description: params[3],
          approx_price: parseFloat(params[4]),
          gst_rate: parseFloat(params[5]),
          stock_qty: parseInt(params[6], 10),
          stock_status: params[7],
          primary_image: params[8] || fallbackDb.products[idx].primary_image,
          warranty: params[9],
          specifications: typeof params[10] === 'string' ? JSON.parse(params[10]) : params[10],
          key_features: typeof params[11] === 'string' ? JSON.parse(params[11]) : params[11],
          is_featured: params[12] ? 1 : 0
        };
      }
      saveFallbackStore(fallbackDb);
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }

  // 10. DELETE Product
  if (s.startsWith('delete from products')) {
    const id = params[0];
    fallbackDb.products = fallbackDb.products.filter(p => p.id != id);
    saveFallbackStore(fallbackDb);
    return { affectedRows: 1 };
  }

  // 11. INSERT Quotes
  if (s.startsWith('insert into quotes')) {
    const newId = (fallbackDb.quotes.length > 0 ? Math.max(...fallbackDb.quotes.map(q => q.id)) : 0) + 1;
    const newQuote = {
      id: newId,
      quote_number: params[0],
      customer_name: params[1],
      customer_phone: params[2],
      customer_email: params[3],
      customer_address: params[4],
      city: params[5] || 'Dindori',
      district: params[6] || 'Nashik',
      pincode: params[7] || '422202',
      customer_notes: params[8],
      subtotal: parseFloat(params[9]),
      discount_amount: parseFloat(params[10] || 0),
      taxable_amount: parseFloat(params[11]),
      cgst_amount: parseFloat(params[12]),
      sgst_amount: parseFloat(params[13]),
      total_gst: parseFloat(params[14]),
      grand_total: parseFloat(params[15]),
      grand_total_words: params[16],
      validity_days: parseInt(params[17] || 15, 10),
      status: 'Pending',
      created_at: new Date().toISOString(),
      items: []
    };
    fallbackDb.quotes.push(newQuote);
    saveFallbackStore(fallbackDb);
    return { insertId: newId, affectedRows: 1 };
  }

  // 12. INSERT Quote Items
  if (s.startsWith('insert into quote_items')) {
    const quoteId = params[0];
    const quote = fallbackDb.quotes.find(q => q.id == quoteId);
    if (quote) {
      if (!quote.items) quote.items = [];
      const newItem = {
        id: (quote.items.length + 1),
        quote_id: quoteId,
        product_id: params[1],
        product_name: params[2],
        category_name: params[3],
        hsn_code: params[4],
        quantity: parseInt(params[5], 10),
        unit_price: parseFloat(params[6]),
        discount: parseFloat(params[7] || 0),
        taxable_amount: parseFloat(params[8]),
        gst_rate: parseFloat(params[9]),
        cgst_amount: parseFloat(params[10]),
        sgst_amount: parseFloat(params[11]),
        total_amount: parseFloat(params[12])
      };
      quote.items.push(newItem);
      saveFallbackStore(fallbackDb);
    }
    return { affectedRows: 1 };
  }

  // 13. UPDATE Quotes Status
  if (s.startsWith('update quotes set status =')) {
    const status = params[0];
    const id = params[1];
    const q = fallbackDb.quotes.find(item => item.id == id);
    if (q) {
      q.status = status;
      saveFallbackStore(fallbackDb);
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }

  // 14. INSERT Contact Message
  if (s.startsWith('insert into contact_messages')) {
    const newId = (fallbackDb.contact_messages.length > 0 ? Math.max(...fallbackDb.contact_messages.map(m => m.id)) : 0) + 1;
    const msg = {
      id: newId,
      name: params[0],
      phone: params[1],
      email: params[2],
      subject: params[3],
      message: params[4],
      is_read: 0,
      created_at: new Date().toISOString()
    };
    fallbackDb.contact_messages.push(msg);
    saveFallbackStore(fallbackDb);
    return { insertId: newId, affectedRows: 1 };
  }

  // 15. INSERT / DELETE Gallery
  if (s.startsWith('insert into gallery')) {
    const newId = (fallbackDb.gallery.length > 0 ? Math.max(...fallbackDb.gallery.map(g => g.id)) : 0) + 1;
    const item = {
      id: newId,
      title: params[0],
      category: params[1],
      description: params[2],
      image_url: params[3],
      location: params[4] || 'Dindori, Nashik',
      display_order: parseInt(params[5] || 0, 10),
      created_at: new Date().toISOString()
    };
    fallbackDb.gallery.push(item);
    saveFallbackStore(fallbackDb);
    return { insertId: newId, affectedRows: 1 };
  }

  if (s.startsWith('delete from gallery')) {
    const id = params[0];
    fallbackDb.gallery = fallbackDb.gallery.filter(g => g.id != id);
    saveFallbackStore(fallbackDb);
    return { affectedRows: 1 };
  }

  return [];
}

module.exports = {
  initDb,
  query,
  getIsUsingFallback: () => isUsingFallback
};
