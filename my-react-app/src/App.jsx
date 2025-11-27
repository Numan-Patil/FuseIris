import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Heart, Copy, RefreshCw, X, Eye, Plus, Sun, Moon, ArrowRight, Sparkles, Zap, Palette, Share2, Download, Check, Sliders, Layout, ChevronRight, Search, Dna, ArrowDown, Trash2, RotateCcw } from 'lucide-react';

// --- Utility Functions ---

const hexToRgb = (hex) => {
  let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

const componentToHex = (c) => {
  let hex = Math.round(c).toString(16);
  return hex.length === 1 ? "0" + hex : hex;
};

const rgbToHex = (r, g, b) => {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
};

const mixColors = (color1, color2, weight = 0.5) => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return color1;

  const r = rgb1.r * (1 - weight) + rgb2.r * weight;
  const g = rgb1.g * (1 - weight) + rgb2.g * weight;
  const b = rgb1.b * (1 - weight) + rgb2.b * weight;

  return rgbToHex(r, g, b);
};

const getLuminance = (hex) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const a = [rgb.r, rgb.g, rgb.b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
};

const getTextColor = (hex) => {
  return getLuminance(hex) > 0.5 ? '#000000' : '#FFFFFF';
};

const getSaturation = (hex) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return 0;
    const r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let s;
    if (max === min) {
        s = 0;
    } else {
        const d = max - min;
        s = max > 0.5 ? d / (2 - max - min) : d / (max + min);
    }
    return s;
};

const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

// Robust copy function for iframes
const copyToClipboard = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    
    // Ensure it's not visible but part of the DOM
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
    } catch (err) {
        console.error('Unable to copy to clipboard', err);
    }
    
    document.body.removeChild(textArea);
};

// --- Initial Data ---

const INITIAL_PALETTES = [
  { id: '1', colors: ['#2C3E50', '#E74C3C', '#ECF0F1', '#3498DB'], name: 'Metric Prime', likes: 1240, tags: ['flat', 'ui'] },
  { id: '2', colors: ['#F7DC6F', '#F1948A', '#A569BD', '#5DADE2'], name: 'Pastel Dreams', likes: 890, tags: ['pastel', 'soft'] },
  { id: '3', colors: ['#0F172A', '#1E293B', '#38BDF8', '#0EA5E9'], name: 'Deep Ocean', likes: 650, tags: ['blue', 'dark'] },
  { id: '4', colors: ['#145A32', '#27AE60', '#82E0AA', '#F4D03F'], name: 'Forest Walk', likes: 420, tags: ['green', 'nature'] },
  { id: '5', colors: ['#641E16', '#922B21', '#D98880', '#FADBD8'], name: 'Rosewood', likes: 310, tags: ['red', 'warm'] },
  { id: '6', colors: ['#F39C12', '#D35400', '#BA4A00', '#1A5276'], name: 'Desert Night', likes: 550, tags: ['orange', 'contrast'] },
  { id: '7', colors: ['#00F5D4', '#00BBF9', '#F15BB5', '#FEE440'], name: 'Cyber Neon', likes: 2130, tags: ['neon', 'vibrant'] },
  { id: '8', colors: ['#4A235A', '#884EA0', '#D2B4DE', '#EBDEF0'], name: 'Royal Velvet', likes: 780, tags: ['purple', 'luxury'] },
  { id: '9', colors: ['#2C3E50', '#E67E22', '#F1C40F', '#ECF0F1'], name: 'Solar Flare', likes: 410, tags: ['warm', 'space'] },
  { id: '10', colors: ['#1A5276', '#2980B9', '#A9CCE3', '#D4E6F1'], name: 'Glacial Ice', likes: 520, tags: ['cold', 'blue'] },
  { id: '11', colors: ['#196F3D', '#52BE80', '#A9DFBF', '#F9E79F'], name: 'Spring Bud', likes: 330, tags: ['nature', 'green'] },
  { id: '12', colors: ['#6C3483', '#AF7AC5', '#E8DAEF', '#F4ECF7'], name: 'Lavender Mist', likes: 670, tags: ['purple', 'pastel'] },
  { id: '13', colors: ['#922B21', '#C0392B', '#E6B0AA', '#F2D7D5'], name: 'Cherry Blossom', likes: 450, tags: ['red', 'pink'] },
  { id: '14', colors: ['#D35400', '#E59866', '#F6DDCC', '#FDF2E9'], name: 'Terracotta', likes: 380, tags: ['earth', 'orange'] },
  { id: '15', colors: ['#212F3C', '#566573', '#ABB2B9', '#D5D8DC'], name: 'Urban Grey', likes: 290, tags: ['monochrome', 'ui'] },
  { id: '16', colors: ['#17202A', '#CB4335', '#F1948A', '#FADBD8'], name: 'Night Rose', likes: 560, tags: ['dark', 'romantic'] },
  { id: '17', colors: ['#117864', '#1ABC9C', '#76D7C4', '#D1F2EB'], name: 'Mint Chip', likes: 720, tags: ['fresh', 'green'] },
  { id: '18', colors: ['#7D3C98', '#BB8FCE', '#D2B4DE', '#F5EEF8'], name: 'Amethyst', likes: 490, tags: ['purple', 'jewel'] },
  { id: '19', colors: ['#7B241C', '#C0392B', '#D98880', '#E6B0AA'], name: 'Brick Red', likes: 340, tags: ['warm', 'rustic'] },
  { id: '20', colors: ['#1F618D', '#5499C7', '#A9CCE3', '#EAF2F8'], name: 'Steel Blue', likes: 460, tags: ['corporate', 'blue'] },
  { id: '21', colors: ['#0E6251', '#148F77', '#73C6B6', '#D0ECE7'], name: 'Sea Glass', likes: 580, tags: ['teal', 'calm'] },
  { id: '22', colors: ['#512E5F', '#884EA0', '#D7BDE2', '#EBDEF0'], name: 'Grape Soda', likes: 610, tags: ['purple', 'pop'] },
  { id: '23', colors: ['#7E5109', '#AF601A', '#F39C12', '#F9E79F'], name: 'Honey Bee', likes: 430, tags: ['yellow', 'nature'] },
  { id: '24', colors: ['#6E2C00', '#A04000', '#E59866', '#F6DDCC'], name: 'Coffee Roast', likes: 540, tags: ['brown', 'warm'] },
  { id: '25', colors: ['#424949', '#7F8C8D', '#B3B6B7', '#E5E7E9'], name: 'Slate', likes: 310, tags: ['minimal', 'grey'] },
  { id: '26', colors: ['#0B5345', '#117A65', '#48C9B0', '#A3E4D7'], name: 'Emerald City', likes: 690, tags: ['green', 'vibrant'] },
  { id: '27', colors: ['#4A235A', '#6C3483', '#AF7AC5', '#E8DAEF'], name: 'Witchcraft', likes: 820, tags: ['dark', 'purple'] },
  { id: '28', colors: ['#9A7D0A', '#D4AC0D', '#F1C40F', '#FCF3CF'], name: 'Gold Rush', likes: 470, tags: ['yellow', 'luxury'] },
  { id: '29', colors: ['#1B4F72', '#2E86C1', '#85C1E9', '#D6EAF8'], name: 'Blueberry', likes: 530, tags: ['blue', 'food'] },
  { id: '30', colors: ['#641E16', '#A93226', '#E74C3C', '#F5B7B1'], name: 'Red Velvet', likes: 640, tags: ['red', 'dessert'] },
  { id: '31', colors: ['#000000', '#1C2833', '#45B39D', '#58D68D'], name: 'Matrix Code', likes: 1100, tags: ['neon', 'dark'] },
  { id: '32', colors: ['#2E4053', '#F4D03F', '#F8C471', '#FDEBD0'], name: 'Night Taxi', likes: 390, tags: ['contrast', 'yellow'] },
  { id: '33', colors: ['#34495E', '#8E44AD', '#9B59B6', '#D7BDE2'], name: 'Twilight', likes: 710, tags: ['purple', 'blue'] },
  { id: '34', colors: ['#145A32', '#229954', '#58D68D', '#ABEBC6'], name: 'Jungle', likes: 480, tags: ['green', 'nature'] },
  { id: '35', colors: ['#78281F', '#B03A2E', '#EC7063', '#F5B7B1'], name: 'Coral Reef', likes: 500, tags: ['red', 'orange'] },
  { id: '36', colors: ['#FF007F', '#FF00FF', '#7F00FF', '#0000FF'], name: 'Vaporwave', likes: 1500, tags: ['neon', 'retro'] },
  { id: '37', colors: ['#FF5733', '#C70039', '#900C3F', '#581845'], name: 'Sunset Blvd', likes: 920, tags: ['warm', 'dark'] },
  { id: '38', colors: ['#008080', '#20B2AA', '#40E0D0', '#7FFFD4'], name: 'Teal Appeal', likes: 660, tags: ['teal', 'fresh'] },
  { id: '39', colors: ['#3B185F', '#A12568', '#FEC260', '#F1FAEE'], name: 'Night Lights', likes: 780, tags: ['contrast', 'vibrant'] },
  { id: '40', colors: ['#283618', '#606C38', '#FEFAE0', '#DDA15E'], name: 'Camping Trip', likes: 840, tags: ['earth', 'nature'] },
  { id: '41', colors: ['#22223B', '#4A4E69', '#9A8C98', '#F2E9E4'], name: 'Old Paper', likes: 590, tags: ['vintage', 'muted'] },
  { id: '42', colors: ['#264653', '#2A9D8F', '#E9C46A', '#F4A261'], name: 'Coastal', likes: 950, tags: ['summer', 'warm'] },
  { id: '43', colors: ['#E63946', '#F1FAEE', '#A8DADC', '#457B9D'], name: 'Patriotic', likes: 420, tags: ['blue', 'red'] },
  { id: '44', colors: ['#003049', '#D62828', '#F77F00', '#FCBF49'], name: 'Primary Pop', likes: 630, tags: ['bold', 'retro'] },
  { id: '45', colors: ['#CCD5AE', '#E9EDC9', '#FEFAE0', '#FAEDCD'], name: 'Matcha Latte', likes: 880, tags: ['pastel', 'green'] },
  { id: '46', colors: ['#03071E', '#370617', '#6A040F', '#9D0208'], name: 'Blood Moon', likes: 740, tags: ['dark', 'red'] },
  { id: '47', colors: ['#8ECAE6', '#219EBC', '#023047', '#FFB703'], name: 'Beach Day', likes: 670, tags: ['summer', 'blue'] },
  { id: '48', colors: ['#F94144', '#F3722C', '#F8961E', '#F9844A'], name: 'Spice Market', likes: 550, tags: ['warm', 'orange'] },
  { id: '49', colors: ['#5F0F40', '#9A031E', '#FB8B24', '#E36414'], name: 'Autumn Leaves', likes: 620, tags: ['fall', 'warm'] },
  { id: '50', colors: ['#9B5DE5', '#F15BB5', '#FEE440', '#00BBF9'], name: 'Candy Shop', likes: 1150, tags: ['bright', 'fun'] },
  { id: '51', colors: ['#2B2D42', '#8D99AE', '#EDF2F4', '#EF233C'], name: 'Modern UI', likes: 790, tags: ['clean', 'ui'] },
  { id: '52', colors: ['#006D77', '#83C5BE', '#EDF6F9', '#FFDDD2'], name: 'Spa Day', likes: 680, tags: ['calm', 'pastel'] },
  { id: '53', colors: ['#355070', '#6D597A', '#B56576', '#E56B6F'], name: 'Mauve Mood', likes: 470, tags: ['muted', 'purple'] },
  { id: '54', colors: ['#1A535C', '#4ECDC4', '#F7FFF7', '#FF6B6B'], name: 'Watermelon', likes: 910, tags: ['fresh', 'contrast'] },
  { id: '55', colors: ['#540D6E', '#EE4266', '#FFD23F', '#3BCEAC'], name: 'Arcade Game', likes: 860, tags: ['neon', 'fun'] },
  { id: '56', colors: ['#7400B8', '#6930C3', '#5E60CE', '#5390D9'], name: 'Deep Space', likes: 730, tags: ['blue', 'purple'] },
  { id: '57', colors: ['#000000', '#14213D', '#FCA311', '#E5E5E5'], name: 'Black & Gold', likes: 1050, tags: ['luxury', 'dark'] },
  { id: '58', colors: ['#606C38', '#283618', '#FEFAE0', '#DDA15E'], name: 'Olive Garden', likes: 540, tags: ['earth', 'green'] },
  { id: '59', colors: ['#ABC2FE', '#FFFFFF', '#F9CC5E', '#000000'], name: 'Undr Horizon', likes: 999, tags: ['blue', 'contrast', 'yellow'] },
  { id: '60', colors: ['#FAF3E1', '#F5E7C6', '#FF6D1F', '#222222'], name: 'Citrus Contrast', likes: 410, tags: ['orange', 'warm', 'contrast'] },
  { id: '61', colors: ['#CCE5CF', '#3DB6B1', '#1581BF', '#F6B1CE'], name: 'Pastel Pop', likes: 520, tags: ['pastel', 'teal', 'pink'] },
  { id: '62', colors: ['#ABE0F0', '#FFEE91', '#F5C857', '#E2852E'], name: 'Sunny Day', likes: 630, tags: ['blue', 'yellow', 'bright'] },
  { id: '63', colors: ['#A3D78A', '#C1E59F', '#FF937E', '#FF5555'], name: 'Watermelon Sugar', likes: 740, tags: ['green', 'red', 'fresh'] },
  { id: '64', colors: ['#67B2D8', '#BF124D', '#76153C', '#5A0E24'], name: 'Berry Blue', likes: 350, tags: ['blue', 'red', 'dark'] },
  { id: '65', colors: ['#F3E8DF', '#E8D1C5', '#57595B', '#452829'], name: 'Minimal Chic', likes: 860, tags: ['minimal', 'brown', 'neutral'] },
  { id: '66', colors: ['#AEDEFC', '#EDFFF0', '#FDEDED', '#F875AA'], name: 'Cotton Candy', likes: 970, tags: ['pastel', 'pink', 'blue'] },
  { id: '67', colors: ['#007E6E', '#73AF6F', '#E7DEAF', '#D7C097'], name: 'Nature Walk', likes: 480, tags: ['green', 'earth', 'teal'] },
  { id: '68', colors: ['#CE7E5A', '#DDC57A', '#F9E7B2', '#D34E4E'], name: 'Spice Route', likes: 590, tags: ['warm', 'orange', 'red'] },
  { id: '69', colors: ['#778873', '#A1BC98', '#D2DCB6', '#F1F3E0'], name: 'Sage Garden', likes: 700, tags: ['green', 'calm', 'earth'] },
  { id: '70', colors: ['#EBD5AB', '#8BAE66', '#628141', '#E67E22'], name: 'Forest Fox', likes: 610, tags: ['green', 'orange', 'nature'] },
  { id: '71', colors: ['#8CA9FF', '#AAC4F5', '#FFF8DE', '#FFF2C6'], name: 'Dreamy Sky', likes: 820, tags: ['blue', 'pastel', 'soft'] },
  { id: '72', colors: ['#060771', '#FFE08F', '#FF6C0C', '#BF1A1A'], name: 'Sunset Sea', likes: 930, tags: ['blue', 'orange', 'contrast'] },
  { id: '73', colors: ['#43334C', '#E83C91', '#FF8FB7', '#F8F4EC'], name: 'Berry Smoothie', likes: 440, tags: ['purple', 'pink', 'dark'] },
  { id: '74', colors: ['#FF5656', '#FFA239', '#FEEE91', '#8CE4FF'], name: 'Summer Fun', likes: 650, tags: ['bright', 'red', 'blue'] },
  { id: '75', colors: ['#850E35', '#EE6983', '#FFC4C4', '#FCF5EE'], name: 'Rose Petal', likes: 760, tags: ['red', 'pink', 'romantic'] },
  { id: '76', colors: ['#FFD3D5', '#E49BA6', '#92487A', '#540863'], name: 'Purple Rain', likes: 870, tags: ['purple', 'pink', 'gradient'] },
  { id: '77', colors: ['#FFDEB9', '#FE6244', '#DC0E0E', '#62109F'], name: 'Retro Sunset', likes: 380, tags: ['red', 'purple', 'retro'] },
  { id: '78', colors: ['#C9B59C', '#D9CFC7', '#EFE9E3', '#F9F8F6'], name: 'Latte Art', likes: 590, tags: ['brown', 'neutral', 'minimal'] },
  { id: '79', colors: ['#D6F4ED', '#87BAC3', '#53629E', '#473472'], name: 'Mystic River', likes: 600, tags: ['teal', 'purple', 'cool'] },
  { id: '80', colors: ['#F5F1DC', '#FF8040', '#0046FF', '#001BB7'], name: 'Electric Sport', likes: 910, tags: ['blue', 'orange', 'vibrant'] },
  { id: '81', colors: ['#FFF8D4', '#A3B087', '#435663', '#313647'], name: 'Vintage Book', likes: 420, tags: ['green', 'dark', 'vintage'] },
  { id: '82', colors: ['#000000', '#4A70A9', '#8FABD4', '#EFECE3'], name: 'Denim & White', likes: 830, tags: ['blue', 'dark', 'classic'] },
  { id: '83', colors: ['#31694E', '#658C58', '#BBC863', '#F0E491'], name: 'Olive Branch', likes: 540, tags: ['green', 'yellow', 'earth'] },
  { id: '84', colors: ['#F7F1DE', '#C4A484', '#B87C4C', '#A8BBA3'], name: 'Earthy Tone', likes: 650, tags: ['brown', 'earth', 'neutral'] },
  { id: '85', colors: ['#C1785A', '#305669', '#8ABEB9', '#B7E5CD'], name: 'Rust & Teal', likes: 760, tags: ['teal', 'orange', 'contrast'] },
  { id: '86', colors: ['#F4F4F4', '#1D546C', '#1A3D64', '#0C2B4E'], name: 'Arctic Navy', likes: 870, tags: ['blue', 'dark', 'cold'] },
  { id: '87', colors: ['#703B3B', '#A18D6D', '#E1D0B3', '#9BB4C0'], name: 'Cozy Cabin', likes: 380, tags: ['brown', 'warm', 'grey'] },
  { id: '88', colors: ['#A72703', '#FCB53B', '#FFE797', '#84994F'], name: 'Harvest', likes: 690, tags: ['orange', 'yellow', 'warm'] },
  { id: '89', colors: ['#174143', '#427A76', '#F9B487', '#F5E5E1'], name: 'Teal Peach', likes: 700, tags: ['teal', 'orange', 'contrast'] },
  { id: '90', colors: ['#5B532C', '#63A361', '#FFC50F', '#FDE7B3'], name: 'Lemon Tree', likes: 810, tags: ['green', 'yellow', 'bright'] },
  { id: '91', colors: ['#93BFC7', '#ABE7B2', '#CBF3BB', '#ECF4E8'], name: 'Fresh Mint', likes: 520, tags: ['green', 'blue', 'fresh'] },
  { id: '92', colors: ['#FFF2EF', '#FFDBB6', '#F7A5A5', '#1A2A4F'], name: 'Navy Coral', likes: 930, tags: ['pink', 'blue', 'contrast'] },
  { id: '93', colors: ['#B7A3E3', '#C2E2FA', '#FFF1CB', '#FF8F8F'], name: 'Pastel Party', likes: 440, tags: ['pastel', 'purple', 'pink'] },
  { id: '94', colors: ['#EEEEEE', '#CBD99B', '#F87B1B', '#11224E'], name: 'Retro Sport', likes: 650, tags: ['orange', 'blue', 'retro'] },
  { id: '95', colors: ['#4E61D3', '#CFADC1', '#E9D484', '#F4F754'], name: 'Funky Town', likes: 760, tags: ['blue', 'yellow', 'fun'] },
  { id: '96', colors: ['#C66E52', '#E9B63B', '#ECD5BC', '#758A93'], name: 'Autumn Vibe', likes: 870, tags: ['orange', 'grey', 'warm'] },
  { id: '97', colors: ['#FFE6D4', '#FFC69D', '#E06B80', '#CD2C58'], name: 'Peachy Pink', likes: 980, tags: ['pink', 'orange', 'warm'] },
  { id: '98', colors: ['#E5E9C5', '#9ECFD4', '#70B2B2', '#016B61'], name: 'Ocean Breeze', likes: 490, tags: ['teal', 'green', 'calm'] },
  { id: '99', colors: ['#957C62', '#E2B59A', '#FFE1AF', '#B77466'], name: 'Soft Clay', likes: 600, tags: ['brown', 'warm', 'earth'] },
  { id: '100', colors: ['#EEEEEE', '#CBCBCB', '#B7B89F', '#777C6D'], name: 'Urban Nature', likes: 710, tags: ['grey', 'green', 'neutral'] },
  { id: '101', colors: ['#FFC400', '#FF3F7F', '#8C00FF', '#450693'], name: 'Cyber Punk', likes: 1220, tags: ['neon', 'purple', 'pink'] },
  { id: '102', colors: ['#B3BFFF', '#DD7BDF', '#FFBBE1', '#FFF58A'], name: 'Unicorn', likes: 1330, tags: ['pastel', 'pink', 'purple'] },
  { id: '103', colors: ['#FBF3D1', '#DEDED1', '#C5C7BC', '#B6AE9F'], name: 'Neutral Sage', likes: 540, tags: ['green', 'neutral', 'minimal'] },
  { id: '104', colors: ['#043915', '#4C763B', '#B0CE88', '#FFFD8F'], name: 'Deep Forest', likes: 650, tags: ['green', 'dark', 'nature'] },
  { id: '105', colors: ['#3B9797', '#16476A', '#132440', '#BF092F'], name: 'Nautical', likes: 760, tags: ['blue', 'red', 'dark'] },
  { id: '106', colors: ['#561530', '#811844', '#9E1C60', '#F5AD18'], name: 'Sunset Berry', likes: 870, tags: ['purple', 'orange', 'rich'] },
  { id: '107', colors: ['#211832', '#412B6B', '#5C3E94', '#F25912'], name: 'Cosmic Dust', likes: 980, tags: ['purple', 'orange', 'space'] },
  { id: '108', colors: ['#FFCF71', '#FF9D00', '#B6771D', '#7B542F'], name: 'Golden Hour', likes: 1090, tags: ['yellow', 'orange', 'warm'] },
  { id: '109', colors: ['#FFBDBD', '#FFA4A4', '#BADFDB', '#FCF9EA'], name: 'Sweet Treat', likes: 600, tags: ['pink', 'pastel', 'soft'] }
];

// --- Components ---

const Toast = ({ message, onClose, action, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900/90 dark:bg-white/90 backdrop-blur-md text-white dark:text-gray-900 px-6 py-3 rounded-full shadow-2xl flex items-center gap-4 z-[60] animate-bounce-in border border-white/10 dark:border-gray-200/20">
      <div className="flex items-center gap-3">
        <Sparkles size={16} className="text-yellow-400 dark:text-yellow-600 animate-pulse" />
        <span className="font-medium text-sm">{message}</span>
      </div>
      {action && (
        <button 
          onClick={action.onClick}
          className="bg-white/20 hover:bg-white/30 dark:bg-black/10 dark:hover:bg-black/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide transition-colors flex items-center gap-1.5"
        >
          {action.icon && <action.icon size={12} />}
          {action.label}
        </button>
      )}
    </div>
  );
};

// IMPROVED SIMPLE BREEDING UI
const BreedingOverlay = ({ data }) => {
    const { parent1, parent2, child, stage } = data;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden">
            {/* Simple Backdrop */}
            <div className={`absolute inset-0 bg-black/80 backdrop-blur-sm transition-all duration-700 ${stage === 'revealing' ? 'opacity-100' : 'opacity-100'}`}></div>
            
            {/* Stage 1: Mixing */}
            {stage === 'mixing' && (
                <div className="relative z-10 flex flex-col items-center justify-center animate-fade-in">
                    <div className="relative w-24 h-24 flex items-center justify-center mb-8">
                         {/* Orbiting colors */}
                        <div className="absolute inset-0 animate-spin-slow">
                             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]" style={{ backgroundColor: parent1.colors[1] }}></div>
                             <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]" style={{ backgroundColor: parent2.colors[1] }}></div>
                        </div>
                        <Dna size={32} className="text-white/80 animate-pulse" />
                    </div>
                    <div className="text-white/70 font-medium tracking-widest text-sm uppercase animate-pulse"> Fusing D.N.A </div>
                </div>
            )}

            {/* Stage 2: The Reveal - SIMPLIFIED */}
            {stage === 'revealing' && (
                <div className="relative z-10 animate-fade-in-scale w-full max-w-sm px-4">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden ring-1 ring-white/10">
                        
                        {/* Header Image / Color Preview */}
                        <div className="h-56 relative flex">
                            {child.colors.map((c, i) => (
                                <div key={i} className="flex-1 h-full relative" style={{ backgroundColor: c }}>
                                    {/* Subtle sheen */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-50"></div>
                                </div>
                            ))}
                            
                            {/* "New" Badge */}
                            <div className="absolute top-4 left-4 bg-black/20 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-white/20">
                                New Species
                            </div>
                        </div>

                        {/* Content Body */}
                        <div className="p-6 text-center relative">
                            {/* Floating Icon */}
                            <div className="w-14 h-14 bg-white dark:bg-gray-800 rounded-full absolute -top-7 left-1/2 transform -translate-x-1/2 flex items-center justify-center shadow-lg border-4 border-white dark:border-gray-900 text-indigo-500">
                                <Sparkles size={24} className="animate-pulse" />
                            </div>

                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-2">{child.name}</h2>
                            
                            {/* Parents Lineage Simple */}
                            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6 bg-gray-50 dark:bg-gray-800/50 py-2 rounded-lg mx-4">
                                <span className="max-w-[80px] truncate">{parent1.name}</span>
                                <span className="text-xs text-gray-300">+</span>
                                <span className="max-w-[80px] truncate">{parent2.name}</span>
                            </div>

                            {/* Status */}
                            <div className="text-xs font-mono text-indigo-500 dark:text-indigo-400 mb-2 uppercase tracking-wide">
                                Saved to Collection
                            </div>
                        </div>
                    </div>
                    
                    {/* Background Glow for Result */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-white/5 blur-3xl -z-10 rounded-full"></div>
                </div>
            )}
        </div>
    );
};

const CreateModal = ({ onClose, onCreate }) => {
    const [colors, setColors] = useState(['#000000', '#444444', '#888888', '#CCCCCC']);
    const [name, setName] = useState('');

    const handleColorChange = (index, value) => {
        const newColors = [...colors];
        newColors[index] = value;
        setColors(newColors);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if(!name) return;
        onCreate({
            id: Date.now().toString(),
            name,
            colors,
            likes: 0,
            tags: ['custom']
        });
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in-scale">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-700 transform transition-all">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                        <Palette className="text-indigo-500" /> Create Palette
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <X className="text-gray-500" size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Palette Name</label>
                        <input 
                            type="text" 
                            required
                            placeholder="e.g., Sunset Vibes"
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-4 gap-4 mb-8">
                        {colors.map((color, i) => (
                            <div key={i} className="flex flex-col gap-2 group">
                                <div className="h-16 w-full rounded-xl shadow-inner overflow-hidden relative border-2 border-transparent group-hover:border-indigo-500 transition-all ring-2 ring-transparent group-hover:ring-indigo-200 dark:group-hover:ring-indigo-900">
                                    <input 
                                        type="color" 
                                        value={color}
                                        onChange={(e) => handleColorChange(i, e.target.value)}
                                        className="absolute inset-0 w-[150%] h-[150%] -top-[25%] -left-[25%] cursor-pointer p-0 border-0"
                                    />
                                </div>
                                <input 
                                    type="text" 
                                    value={color}
                                    onChange={(e) => handleColorChange(i, e.target.value)}
                                    className="text-xs w-full text-center uppercase border rounded py-1.5 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 font-mono tracking-wider"
                                    maxLength={7}
                                />
                            </div>
                        ))}
                    </div>
                    <button type="submit" className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-indigo-500/30">
                        <Plus size={18} /> Create Palette
                    </button>
                </form>
            </div>
        </div>
    );
};

const ContextVisualizer = ({ palette, onClose, onExport }) => {
  if (!palette) return null;

  const sortedByLuminance = [...palette.colors].sort((a, b) => getLuminance(a) - getLuminance(b));
  const avgLuminance = palette.colors.reduce((acc, c) => acc + getLuminance(c), 0) / 4;
  const isDarkTheme = avgLuminance < 0.5;

  const bgPrimary = isDarkTheme ? sortedByLuminance[0] : sortedByLuminance[3];
  const bgSecondary = isDarkTheme ? sortedByLuminance[1] : sortedByLuminance[2]; 
  const accent = isDarkTheme ? sortedByLuminance[3] : sortedByLuminance[0];
  const highlight = isDarkTheme ? sortedByLuminance[2] : sortedByLuminance[1];
  
  const textPrimary = getTextColor(bgPrimary);

  const exportCSS = () => {
    const css = `:root {
  --color-primary: ${palette.colors[0]};
  --color-secondary: ${palette.colors[1]};
  --color-accent: ${palette.colors[2]};
  --color-highlight: ${palette.colors[3]};
}`;
    copyToClipboard(css);
    onExport();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 md:p-6 animate-fade-in overflow-hidden">
      <div className="w-full max-w-7xl h-[95vh] bg-gray-50 dark:bg-gray-900 rounded-3xl shadow-2xl relative flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700 animate-slide-up-modal">
        
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-6 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 shrink-0">
           <div className="flex items-center gap-4">
             <div className="flex -space-x-2 group cursor-default">
                {palette.colors.map((c, i) => (
                    <div 
                        key={i} 
                        className="w-6 h-6 rounded-full border border-white transform transition-transform duration-300 group-hover:translate-x-1" 
                        style={{backgroundColor: c}} 
                    />
                ))}
             </div>
             <div className="h-4 w-[1px] bg-gray-300 dark:bg-gray-600"></div>
             <div>
               <h3 className="font-bold text-gray-900 dark:text-white leading-tight">Live Preview</h3>
             </div>
           </div>
           
           <div className="flex items-center gap-3">
             <button onClick={exportCSS} className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors dark:text-gray-200 active:scale-95 group">
               <Download size={16} className="group-hover:-translate-y-0.5 transition-transform" /> 
               Copy CSS
             </button>
             <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors active:scale-90">
               <X size={24} className="text-gray-500" />
             </button>
           </div>
        </div>

        {/* Website Content */}
        <div className="flex-1 overflow-y-auto scrollbar-hide relative transition-colors duration-700" style={{ backgroundColor: bgPrimary, color: textPrimary }}>
            
            {/* Nav Mock */}
            <div className="px-8 py-6 flex justify-between items-center max-w-6xl mx-auto w-full sticky top-0 z-10 backdrop-blur-sm bg-opacity-90 transition-all" style={{ backgroundColor: `${bgPrimary}E6` }}>
                <div className="font-bold text-2xl tracking-tighter flex items-center gap-2 group cursor-pointer">
                    <div className="w-8 h-8 rounded-lg transform group-hover:rotate-12 transition-transform" style={{ background: `linear-gradient(135deg, ${accent}, ${highlight})`}}></div>
                    Brand.
                </div>
                <div className="hidden md:flex gap-8 text-sm font-medium opacity-80">
                    {['Products', 'Solutions', 'Resources', 'Pricing'].map(item => (
                        <span key={item} className="cursor-pointer hover:opacity-100 relative group">
                            {item}
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-current transition-all group-hover:w-full"></span>
                        </span>
                    ))}
                </div>
                <button className="px-5 py-2.5 rounded-full font-bold text-sm transition-transform hover:scale-105 active:scale-95 shadow-lg" style={{ backgroundColor: accent, color: getTextColor(accent) }}>
                    Get Started
                </button>
            </div>

            {/* Hero Section */}
            <div className="max-w-6xl mx-auto px-8 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-8 animate-slide-in-right">
                    <div className="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase border border-current opacity-60 hover:opacity-100 transition-opacity cursor-default">
                        v2.0 Release
                    </div>
                    <h1 className="text-6xl md:text-7xl font-extrabold leading-tight tracking-tight">
                        Shape the <br/>
                        <span className="text-transparent bg-clip-text animate-gradient-text" style={{ backgroundImage: `linear-gradient(to right, ${accent}, ${highlight}, ${accent})`, backgroundSize: '200% auto' }}>
                            Future.
                        </span>
                    </h1>
                    <p className="text-xl opacity-70 leading-relaxed max-w-md">
                        Experience a digital ecosystem defined by color. Your palette dictates the mood, we handle the code.
                    </p>
                    <div className="flex flex-wrap gap-4 pt-4">
                        <button className="px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 active:translate-y-0 active:scale-95" style={{ backgroundColor: highlight, color: getTextColor(highlight) }}>
                            Start Building
                        </button>
                        <button className="px-8 py-4 rounded-xl font-bold text-lg border-2 border-current opacity-80 hover:opacity-100 transition-all flex items-center gap-2 hover:gap-3">
                            Documentation <ArrowRight size={18} />
                        </button>
                    </div>
                </div>

                {/* Abstract visualizer graphic */}
                <div className="relative h-[500px] w-full hidden lg:block animate-float">
                    <div className="absolute top-0 right-0 w-4/5 h-4/5 rounded-[3rem] opacity-30 blur-3xl animate-pulse-slow" style={{ backgroundColor: accent }}></div>
                    <div className="absolute bottom-0 left-10 w-3/5 h-3/5 rounded-full opacity-30 blur-3xl animate-pulse-slow" style={{ backgroundColor: highlight, animationDelay: '1s' }}></div>
                    
                    {/* Floating Cards */}
                    <div className="absolute top-10 right-10 w-72 p-6 rounded-2xl backdrop-blur-xl border border-white/10 shadow-2xl transform rotate-3 hover:rotate-0 transition-all duration-500 cursor-pointer hover:scale-105" style={{ backgroundColor: `${bgSecondary}80` }}>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-md" style={{ backgroundColor: accent, color: getTextColor(accent) }}>A</div>
                            <div>
                                <div className="font-bold text-sm">Design System</div>
                                <div className="text-xs opacity-60">System Status: Stable</div>
                            </div>
                        </div>
                        <div className="h-24 rounded-lg w-full mb-4 opacity-50" style={{ backgroundColor: bgPrimary }}></div>
                        <div className="h-3 w-2/3 rounded-full opacity-30 mb-2" style={{ backgroundColor: textPrimary }}></div>
                        <div className="h-3 w-1/2 rounded-full opacity-30" style={{ backgroundColor: textPrimary }}></div>
                    </div>

                    <div className="absolute bottom-20 left-0 w-64 p-5 rounded-2xl backdrop-blur-md border border-white/10 shadow-xl transform -rotate-6 hover:rotate-0 transition-all duration-500 z-10 cursor-pointer hover:scale-105" style={{ backgroundColor: `${highlight}20` }}>
                        <div className="flex justify-between items-end">
                            <div>
                                <div className="text-3xl font-bold">+24%</div>
                                <div className="text-xs opacity-70">Growth Metric</div>
                            </div>
                            <Sparkles size={24} style={{ color: accent }} className="animate-spin-slow" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Strip */}
            <div className="py-20" style={{ backgroundColor: bgSecondary }}>
                <div className="max-w-6xl mx-auto px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="p-8 rounded-3xl hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 border border-white/5 shadow-lg group" style={{ backgroundColor: bgPrimary }}>
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 text-xl transform group-hover:scale-110 transition-transform" style={{ backgroundColor: i===1 ? highlight : accent, color: getTextColor(i===1 ? highlight : accent) }}>
                                {i === 1 ? <Layout /> : i === 2 ? <Zap /> : <Sliders />}
                            </div>
                            <h3 className="text-xl font-bold mb-3">Modular Components</h3>
                            <p className="opacity-60 leading-relaxed">
                                Adapts to any color scheme automatically using our genetic breeding engine logic.
                            </p>
                        </div>
                    ))}
                </div>
            </div>

             {/* Footer Mock */}
             <div className="py-12 text-center opacity-40 text-sm">
                <p>© FuseIris - For Humans by Undrstanding.</p>
             </div>
        </div>
      </div>
    </div>
  );
};

const PaletteCard = ({ palette, onDragStart, onDrop, isDraggingOver, copyColor, onLike, onView, onDelete, index }) => {
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  
  // Check if palette is custom or mixed
  const isCustom = palette.tags && (palette.tags.includes('custom') || palette.tags.includes('mixed'));

  const handleCopy = (e, color, idx) => {
      e.stopPropagation();
      copyColor(color);
      copyToClipboard(color); // Use the robust copy function
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 1500);
  };

  const handleLikeLocal = (e) => {
      e.stopPropagation();
      setIsLiked(true);
      onLike(palette.id);
      setTimeout(() => setIsLiked(false), 300); // Reset bounce trigger
  };

  return (
    <div 
      className={`group relative bg-white dark:bg-gray-800 rounded-2xl transition-all duration-500 ease-out-back ${isDraggingOver ? 'ring-4 ring-indigo-500/20 scale-105 z-10' : 'hover:-translate-y-1'} shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden h-full flex flex-col animate-slide-up-fade`}
      style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
      draggable="true"
      onDragStart={(e) => onDragStart(e, palette)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => onDrop(e, palette)}
    >
      {/* Visual Header */}
      <div className="h-44 w-full flex relative cursor-pointer" onClick={() => onView(palette)}>
          
         {/* Drop Zone Overlay */}
         {isDraggingOver && (
            <div className="absolute inset-0 z-20 bg-indigo-600/90 backdrop-blur-sm flex flex-col items-center justify-center text-white animate-pulse">
              <RefreshCw size={32} className="mb-2 animate-spin" />
              <span className="font-bold tracking-wider">BREED PALETTES</span>
            </div>
         )}
        
        {palette.colors.map((color, idx) => (
          <div 
            key={idx} 
            className="flex-1 h-full relative group/color transition-all duration-500 ease-out hover:flex-[2.5]"
            style={{ backgroundColor: color }}
            onClick={(e) => handleCopy(e, color, idx)}
          >
              {/* Interaction Overlay */}
              <div className={`absolute inset-0 flex flex-col items-center justify-end pb-4 transition-all duration-300 ${copiedIdx === idx ? 'opacity-100 bg-black/20' : 'opacity-0 group-hover/color:opacity-100'}`}>
                 {copiedIdx === idx ? (
                    <div className="flex flex-col items-center animate-pop-in">
                        <Check size={24} className="text-white drop-shadow-md mb-1" />
                        <span className="text-[10px] font-bold text-white uppercase tracking-widest bg-black/30 px-2 py-0.5 rounded">COPIED</span>
                    </div>
                 ) : (
                    <>
                        <span className="text-[10px] uppercase font-bold tracking-widest bg-black/20 backdrop-blur-sm text-white px-2 py-1 rounded-lg transform translate-y-2 group-hover/color:translate-y-0 transition-transform shadow-sm">
                            {color}
                        </span>
                        <span className="mt-1 text-[8px] text-white/90 font-medium opacity-0 group-hover/color:opacity-100 transition-opacity delay-100">Click to Copy</span>
                    </>
                 )}
              </div>
          </div>
        ))}

        {/* Action Buttons Floating */}
        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
             <button 
                onClick={(e) => {
                    e.stopPropagation();
                    onView(palette);
                }}
                className="p-2 bg-white/90 dark:bg-black/60 backdrop-blur-md rounded-full text-gray-700 dark:text-white shadow-lg hover:scale-110 active:scale-95 transition-all"
                title="Visualize"
            >
                <Eye size={16} />
            </button>
            
            {isCustom && (
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(palette.id);
                    }}
                    className="p-2 bg-white/90 dark:bg-black/60 backdrop-blur-md rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 shadow-lg hover:scale-110 active:scale-95 transition-all"
                    title="Delete"
                >
                    <Trash2 size={16} />
                </button>
            )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div className="flex items-start justify-between mb-3">
            <div>
                <h3 className="font-bold text-gray-800 dark:text-gray-100 text-base leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {palette.name}
                </h3>
                {palette.tags && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                        {palette.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 uppercase tracking-wide border border-transparent hover:border-gray-300 dark:hover:border-gray-500 transition-all cursor-default">
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>
            
            <button 
                onClick={handleLikeLocal}
                className={`flex flex-col items-center justify-center min-w-[36px] h-[36px] rounded-xl transition-all active:scale-90 ${palette.likes % 2 !== 0 ? 'bg-pink-50 dark:bg-pink-900/20 text-pink-500' : 'bg-gray-50 dark:bg-gray-700 text-gray-400 hover:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/10'}`}
            >
                <Heart size={16} className={`transition-transform duration-300 ${palette.likes % 2 !== 0 ? 'fill-current scale-110' : ''} ${isLiked ? 'animate-heart-bounce' : ''}`} />
            </button>
        </div>
        
        {/* Footer Info */}
        <div className="pt-3 mt-2 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
             <div className="flex -space-x-1.5 hover:space-x-0.5 transition-all duration-300">
                {palette.colors.map((c, i) => (
                    <div key={i} className="w-5 h-5 rounded-full border-2 border-white dark:border-gray-800 shadow-sm transform transition-transform hover:scale-110 hover:z-10" style={{ backgroundColor: c }}></div>
                ))}
             </div>
             <span className="text-xs font-mono text-gray-400 flex items-center gap-1">
                 <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse"></span>
                 {palette.likes} likes
             </span>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [palettes, setPalettes] = useState(() => {
    const saved = localStorage.getItem('fuseiris_palettes');
    return saved ? JSON.parse(saved) : INITIAL_PALETTES;
  });
  
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [draggedPalette, setDraggedPalette] = useState(null);
  const [dropTargetId, setDropTargetId] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const [viewingPalette, setViewingPalette] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [logoColor, setLogoColor] = useState(null);
  const [breedingData, setBreedingData] = useState(null);
  const [deletedPaletteData, setDeletedPaletteData] = useState(null);
  
  const resultsRef = useRef(null);

  // Persistence
  useEffect(() => {
    localStorage.setItem('fuseiris_palettes', JSON.stringify(palettes));
  }, [palettes]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Handle scroll on Enter key
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && resultsRef.current) {
       const headerOffset = 140; // Header height + cushion
       const elementPosition = resultsRef.current.getBoundingClientRect().top;
       const offsetPosition = elementPosition + window.scrollY - headerOffset;
       
       window.scrollTo({
         top: offsetPosition,
         behavior: "smooth"
       });
    }
  };

  // Filtering Logic
  const filteredPalettes = useMemo(() => {
    let result = palettes;

    // 1. Filter by Category/Tab
    if (activeFilter !== 'All') {
        result = result.filter(p => {
            if (activeFilter === 'Trending') return p.likes > 800;
            if (activeFilter === 'New') return parseInt(p.id) > 1000;
            if (activeFilter === 'Custom') return p.tags && (p.tags.includes('custom') || p.tags.includes('mixed'));
            if (activeFilter === 'Dark Mode') {
                 const darkCount = p.colors.filter(c => getLuminance(c) < 0.5).length;
                 return darkCount >= 2;
            }
            if (activeFilter === 'Neon') {
                const saturatedCount = p.colors.filter(c => getSaturation(c) > 0.7).length;
                return saturatedCount >= 2;
            }
            if (activeFilter === 'Pastel') {
                 const pastelCount = p.colors.filter(c => getSaturation(c) < 0.6 && getLuminance(c) > 0.6).length;
                 return pastelCount >= 2;
            }
            // Fallback to tags check
            return p.tags && p.tags.includes(activeFilter.toLowerCase());
        });
    }

    // 2. Filter by Search Query
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        result = result.filter(p => 
            p.name.toLowerCase().includes(query) || 
            (p.tags && p.tags.some(tag => tag.toLowerCase().includes(query))) ||
            p.colors.some(color => color.toLowerCase().includes(query))
        );
    }
    
    return result;
  }, [palettes, activeFilter, searchQuery]);

  const handleDragStart = (e, palette) => {
    setDraggedPalette(palette);
    e.dataTransfer.effectAllowed = "copy"; 
  };

  const handleDragEnter = (e, targetPalette) => {
    e.preventDefault();
    if (draggedPalette && draggedPalette.id !== targetPalette.id) {
        setDropTargetId(targetPalette.id);
    }
  };

  const handleDrop = (e, targetPalette) => {
    e.preventDefault();
    setDropTargetId(null);
    if (!draggedPalette || draggedPalette.id === targetPalette.id) return;

    // Genetic Algorithm with Uniqueness Check
    const generateChildGenome = () => {
        return draggedPalette.colors.map((c1, i) => {
           const c2 = targetPalette.colors[i];
           // Increased Entropy: 0.1 to 0.9 range allows for children that lean heavily towards one parent
           // This ensures that mixing A + B multiple times yields different results (siblings)
           const weight = 0.1 + (Math.random() * 0.8); 
           return mixColors(c1, c2, weight);
        });
    };

    let childColors = generateChildGenome();
    let attempts = 0;
    
    // Collision Detection: Ensure we don't duplicate an existing palette exactly
    // Reroll up to 10 times if we accidentally generate a clone
    while (palettes.some(p => p.colors.join('') === childColors.join('')) && attempts < 10) {
        childColors = generateChildGenome();
        attempts++;
    }

    const newId = Date.now().toString();
    
    // ---------------------------------------------------------
    // NEW: Unique Name Generation Logic
    // ---------------------------------------------------------
    const p1Words = draggedPalette.name.split(' ');
    const p2Words = targetPalette.name.split(' ');
    let baseName = `${p1Words[0]} ${p2Words[p2Words.length - 1] || 'Fusion'}`;
    
    let finalName = baseName;
    let nameAttempts = 0;
    const modifiers = ['II', 'III', 'Remix', 'Neo', 'Flux', 'Vibe', 'Nova', 'Echo', 'X', 'Prime', 'Max', 'Pro'];
    
    // Check if name exists, if so, cycle through modifiers until unique
    while (palettes.some(p => p.name === finalName)) {
        const modifier = modifiers[nameAttempts % modifiers.length];
        // If we run out of modifiers, start appending numbers (e.g. Neo 2)
        const extra = Math.floor(nameAttempts / modifiers.length) > 0 ? ` ${Math.floor(nameAttempts / modifiers.length) + 1}` : '';
        finalName = `${baseName} ${modifier}${extra}`;
        nameAttempts++;
    }

    const newPalette = {
      id: newId,
      colors: childColors,
      name: finalName,
      likes: 0,
      tags: ['mixed', 'custom']
    };

    // Start Breeding Animation
    setBreedingData({
        parent1: draggedPalette,
        parent2: targetPalette,
        child: newPalette,
        stage: 'mixing'
    });
    setDraggedPalette(null);

    // Sequence
    setTimeout(() => {
        setBreedingData(prev => ({ ...prev, stage: 'revealing' }));
    }, 2000); // Slightly faster mix for better UX

    setTimeout(() => {
        setPalettes([newPalette, ...palettes]);
        setBreedingData(null);
        setToastMsg(`🧬 Successfully bred "${newPalette.name}"!`);
    }, 5500); // Give user enough time to admire the new card
  };

  const handleLike = (id) => {
    setPalettes(palettes.map(p => 
      p.id === id ? { ...p, likes: p.likes + 1 } : p
    ));
  };

  const handleCopy = (hex) => {
    copyToClipboard(hex);
    // Note: Local toast logic inside card handles the immediate feedback
  };
  
  const handleCreate = (newPalette) => {
      setPalettes([newPalette, ...palettes]);
      setIsCreating(false);
      setToastMsg(`Palette "${newPalette.name}" created!`);
  };

  const handleDelete = (id) => {
    const paletteToDelete = palettes.find(p => p.id === id);
    if (!paletteToDelete) return;

    // Filter out
    setPalettes(prev => prev.filter(p => p.id !== id));
    
    // Store for undo
    setDeletedPaletteData(paletteToDelete);
    
    // Show Toast with Undo
    setToastMsg({
        text: `Deleted "${paletteToDelete.name}"`,
        duration: 7000,
        action: {
            label: "Undo",
            icon: RotateCcw,
            onClick: () => handleUndo(paletteToDelete)
        }
    });
  };

  const handleUndo = (palette) => {
    setPalettes(prev => [palette, ...prev]);
    setDeletedPaletteData(null);
    setToastMsg(null); // Close toast immediately
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${darkMode ? 'bg-[#0f1115] text-gray-100' : 'bg-slate-50 text-slate-900'} font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden`}>
      
      {/* Glass Navbar */}
      <nav className="sticky top-0 z-40 bg-white/80 dark:bg-[#0f1115]/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-800/50 h-18 transition-all">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Search Bar - Taking more space since logo is gone */}
            <div className="flex-1 max-w-lg relative group mr-4">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-full leading-5 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 sm:text-sm transition-all"
                    placeholder="Search palettes, hex codes, or tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                />
             </div>

            <div className="hidden lg:flex items-center gap-1">
                {['All', 'Trending', 'Neon', 'Pastel', 'Custom'].map(link => (
                    <button 
                        key={link} 
                        onClick={() => setActiveFilter(link)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all active:scale-95 ${activeFilter === link ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    >
                        {link}
                    </button>
                ))}
            </div>

            <div className="flex items-center gap-3">
               <button 
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-all hover:rotate-12 active:scale-90"
                >
                  {darkMode ? <Sun size={20} /> : <Moon size={20} />}
               </button>
               <button 
                onClick={() => setIsCreating(true)}
                className="hidden sm:flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-2.5 rounded-full font-bold text-sm shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all confetti-btn"
               >
                  <Plus size={16} /> Create
               </button>
            </div>
         </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
         <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in-up">
            
            {/* Main Headline with Animated Logo */}
            <div className="flex flex-col items-center justify-center mb-8 cursor-pointer group" onClick={() => { setActiveFilter('All'); setSearchQuery(''); }}>
                <div 
                    className="relative transform transition-transform group-hover:scale-105 active:scale-95 duration-200 mb-6"
                    onMouseEnter={() => setLogoColor(getRandomColor())}
                >
                   <div 
                        className="w-20 h-20 bg-black dark:bg-gray-200 rounded-2xl rotate-3 group-hover:rotate-12 transition-all duration-300 shadow-xl"
                        style={logoColor ? { backgroundColor: mixColors(logoColor, '#000000', 0.2) } : {}}
                   ></div>
                   <div 
                        className="w-20 h-20 bg-gray-800 dark:bg-white rounded-2xl absolute top-0 left-0 -rotate-3 group-hover:-rotate-6 transition-all duration-300 opacity-90 flex items-center justify-center border-2 border-white/20 dark:border-black/20"
                        style={logoColor ? { backgroundColor: logoColor } : {}}
                   >
                     <RefreshCw 
                        className="text-white dark:text-black w-10 h-10 transition-transform group-hover:rotate-180 duration-700" 
                        style={logoColor ? { color: getTextColor(logoColor) } : {}}
                      />
                   </div>
                </div>
                <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight text-black dark:text-white group-hover:opacity-90 transition-opacity mb-4">
                  FuseIris
                </h1>
                <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-xl mx-auto font-medium leading-relaxed">
                    Drag and drop palettes to genetically mix colors and discover millions of unique combinations.
                </p>
            </div>
            
            {/* Functional Filter Pills */}
            <div className="flex flex-wrap justify-center gap-3">
               {['All', 'Trending', 'Neon', 'Pastel', 'Custom', 'Dark Mode', 'Nature'].map((filter, i) => (
                  <button 
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    style={{ animationDelay: `${i * 50}ms` }}
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all animate-slide-up-fade backwards ${activeFilter === filter
                        ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-lg scale-105 ring-2 ring-offset-2 ring-gray-900 dark:ring-white ring-offset-slate-50 dark:ring-offset-gray-900' 
                        : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-indigo-500 hover:text-indigo-500 hover:-translate-y-0.5'}`}
                  >
                      {filter}
                  </button>
               ))}
            </div>
         </div>

         {/* Mobile Search - Visible only on small screens */}
         <div className="md:hidden mb-8 px-1">
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 shadow-sm transition-all"
                    placeholder="Search colors, tags, etc..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                />
            </div>
         </div>

         {/* Grid */}
         <div ref={resultsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-20">
            {filteredPalettes.length > 0 ? (
                filteredPalettes.map((palette, index) => (
                    <div 
                        key={palette.id}
                        onDragEnter={(e) => handleDragEnter(e, palette)}
                        onDragLeave={() => {}}
                        className="transform transition-all duration-300"
                    >
                        <PaletteCard 
                            index={index}
                            palette={palette}
                            onDragStart={handleDragStart}
                            onDrop={handleDrop}
                            isDraggingOver={dropTargetId === palette.id}
                            copyColor={handleCopy}
                            onLike={handleLike}
                            onView={setViewingPalette}
                            onDelete={handleDelete}
                        />
                    </div>
                ))
            ) : (
                <div className="col-span-full py-20 text-center opacity-60">
                    <div className="inline-block p-4 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                        <Search size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold">No palettes found</h3>
                    <p>Try adjusting your search or filters</p>
                    <button 
                        onClick={() => {setSearchQuery(''); setActiveFilter('All');}}
                        className="mt-4 text-indigo-500 hover:text-indigo-600 font-medium"
                    >
                        Clear filters
                    </button>
                </div>
            )}

            {/* "Add New" Card */}
            <button 
                onClick={() => setIsCreating(true)}
                className="group relative h-full min-h-[320px] border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:border-indigo-500 hover:text-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-all active:scale-95 animate-slide-up-fade"
                style={{ animationDelay: `${filteredPalettes.length * 50}ms` }}
            >
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900">
                    <Plus size={32} className="group-hover:rotate-90 transition-transform duration-300" />
                </div>
                <span className="font-bold text-lg">Create Custom</span>
                <span className="text-xs mt-2 opacity-60">Define your own 4 colors</span>
            </button>
         </div>

         {/* Footer */}
         <footer className="mt-16 mb-8 text-center">
            <p className="text-2xl md:text-4xl font-bold text-gray-300 dark:text-gray-700 transition-colors duration-300 hover:text-gray-400 dark:hover:text-gray-600">
                Made with <span 
                    className="text-red-500 transition-colors duration-300 cursor-pointer inline-block hover:scale-125 transform active:scale-95"
                    onMouseEnter={(e) => e.target.style.color = getRandomColor()}
                >❤️</span> by Undrstanding
            </p>
         </footer>
      </div>

      {/* Modals & Overlays */}
      {viewingPalette && (
        <ContextVisualizer 
            palette={viewingPalette} 
            onClose={() => setViewingPalette(null)} 
            onExport={() => setToastMsg("CSS copied to clipboard!")}
        />
      )}

      {breedingData && (
        <BreedingOverlay data={breedingData} />
      )}

      {isCreating && (
        <CreateModal onClose={() => setIsCreating(false)} onCreate={handleCreate} />
      )}

      {toastMsg && (
        <Toast 
            message={typeof toastMsg === 'string' ? toastMsg : toastMsg.text} 
            duration={typeof toastMsg === 'string' ? 3000 : (toastMsg.duration || 3000)}
            action={typeof toastMsg === 'string' ? null : toastMsg.action}
            onClose={() => setToastMsg(null)} 
        />
      )}

      {/* Animations CSS */}
      <style jsx global>{`
        /* Confetti Button Styles */
        .confetti-btn {
            position: relative;
            isolation: isolate;
        }
        .confetti-btn::before, .confetti-btn::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 6px;
            height: 6px;
            border-radius: 50%;
            transform: translate(-50%, -50%);
            pointer-events: none;
            z-index: -1;
            opacity: 0;
        }
        .confetti-btn:hover::before {
            animation: confetti-burst-1 0.8s ease-out forwards;
        }
        .confetti-btn:hover::after {
            animation: confetti-burst-2 0.8s ease-out 0.1s forwards;
        }

        @keyframes confetti-burst-1 {
            0% { opacity: 1; box-shadow: 0 0 0 0 #6366f1; }
            100% {
                opacity: 0;
                box-shadow: 
                    -30px -40px 0 -2px #6366f1,
                    30px -40px 0 -2px #ec4899,
                    -30px 40px 0 -2px #eab308,
                    30px 40px 0 -2px #8b5cf6,
                    0px -50px 0 -2px #14b8a6,
                    0px 50px 0 -2px #ef4444;
            }
        }
        @keyframes confetti-burst-2 {
            0% { opacity: 1; box-shadow: 0 0 0 0 #fff; }
            100% {
                opacity: 0;
                box-shadow: 
                    -45px 0px 0 -2px #ec4899,
                    45px 0px 0 -2px #6366f1,
                    0px -60px 0 -2px #eab308,
                    0px 60px 0 -2px #14b8a6,
                    -30px -30px 0 -2px #ef4444,
                    30px 30px 0 -2px #8b5cf6;
            }
        }

        @keyframes bounce-in {
            0% { transform: translate(-50%, 100%); opacity: 0; }
            60% { transform: translate(-50%, -10%); opacity: 1; }
            100% { transform: translate(-50%, 0); }
        }
        .animate-bounce-in {
            animation: bounce-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .animate-fade-in {
            animation: fade-in 0.3s ease-out forwards;
        }
         @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
            animation: fade-in-up 0.6s ease-out forwards;
        }
        @keyframes fade-in-scale {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in-scale {
            animation: fade-in-scale 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes slide-up-fade {
             from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up-fade {
            animation: slide-up-fade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes heart-bounce {
            0% { transform: scale(1); }
            50% { transform: scale(1.5); }
            100% { transform: scale(1); }
        }
        .animate-heart-bounce {
            animation: heart-bounce 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        @keyframes pop-in {
            0% { transform: scale(0); opacity: 0; }
            80% { transform: scale(1.1); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
        }
        .animate-pop-in {
            animation: pop-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        @keyframes slide-up-modal {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up-modal {
            animation: slide-up-modal 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes gradient-text {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        .animate-gradient-text {
            animation: gradient-text 3s ease infinite;
        }
        @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
            100% { transform: translateY(0px); }
        }
        .animate-float {
            animation: float 6s ease-in-out infinite;
        }
        @keyframes float-reverse {
            0% { transform: translateY(0px); }
            50% { transform: translateY(20px); }
            100% { transform: translateY(0px); }
        }
        .animate-float-reverse {
            animation: float-reverse 6s ease-in-out infinite;
        }
        @keyframes pulse-slow {
             0% { opacity: 0.3; transform: scale(1); }
             50% { opacity: 0.4; transform: scale(1.05); }
             100% { opacity: 0.3; transform: scale(1); }
        }
        .animate-pulse-slow {
            animation: pulse-slow 4s ease-in-out infinite;
        }
        @keyframes pulse-fast {
             0% { opacity: 0.8; transform: scale(1); }
             50% { opacity: 1; transform: scale(1.1); }
             100% { opacity: 0.8; transform: scale(1); }
        }
        .animate-pulse-fast {
            animation: pulse-fast 1s ease-in-out infinite;
        }
        @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
            animation: spin-slow 8s linear infinite;
        }
         @keyframes spin-slow-custom {
            from { transform: rotate(3deg); }
            to { transform: rotate(363deg); }
        }
        .animate-spin-slow-custom {
            animation: spin-slow-custom 12s linear infinite;
        }
        @keyframes explode-reveal {
            0% { opacity: 0; transform: scale(0.5); }
            50% { opacity: 1; transform: scale(1.05); }
            100% { opacity: 1; transform: scale(1); }
        }
        .animate-explode-reveal {
            animation: explode-reveal 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        @keyframes reveal-scale {
            0% { opacity: 0; transform: scale(0.8); filter: blur(10px); }
            100% { opacity: 1; transform: scale(1); filter: blur(0px); }
        }
        .animate-reveal-scale {
            animation: reveal-scale 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        @keyframes card-pop {
            0% { opacity: 0; transform: scale(0.8) translateY(50px); }
            100% { opacity: 1; transform: scale(1.25) translateY(0); }
        }
        .animate-card-pop {
            animation: card-pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s forwards;
        }
        @keyframes slide-down {
            from { transform: translateY(-50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-down {
            animation: slide-down 0.5s ease-out forwards;
        }
        @keyframes ping-slow {
            75%, 100% { transform: scale(2); opacity: 0; }
        }
        .animate-ping-slow {
            animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
