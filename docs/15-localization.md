# Regional Localization

Multi-region resume optimization for US, UK, EU, and APAC markets.

## 🌍 Complete Architecture

For the complete localization architecture, see:
- [LOCALIZATION_ARCHITECTURE.md](../LOCALIZATION_ARCHITECTURE.md) - Full system architecture

## 🎯 Supported Regions

### 🇺🇸 United States
- Use "Resume" not "CV"
- No photo, age, or marital status
- Date format: MM/DD/YYYY
- Phone: +1 (555) 123-4567
- 1-2 pages maximum

### 🇬🇧 United Kingdom
- Use "CV" not "Resume"
- Photo optional
- Date format: DD/MM/YYYY
- Phone: +44 20 1234 5678
- 2 pages standard

### 🇪🇺 European Union
- Use "CV" or "Curriculum Vitae"
- Photo often expected
- Date format: DD.MM.YYYY
- Detailed format preferred
- 2-3 pages acceptable

### 🌏 Asia-Pacific
- Varies by country
- Photo often required
- Detailed personal information
- Academic credentials emphasized
- Format varies by country

## 🔧 How It Works

### 1. User Selects Region

```typescript
<button onClick={() => handleLocalization('US')}>
  🇺🇸 Optimize for US
</button>
```

### 2. API Call

```typescript
const response = await fetch('/api/localize', {
  method: 'POST',
  body: JSON.stringify({
    resume_text: currentResume.rawText,
    target_region: 'US'
  })
})
```

### 3. Backend Processing

```python
def get_localization_advice(resume_text: str, target_region: str):
    guidelines = REGION_GUIDELINES[target_region]
    
    # Check terminology
    terminology_changes = []
    for source, target in guidelines["terminology"].items():
        if source.lower() in resume_text.lower():
            terminology_changes.append({
                "from": source,
                "to": target,
                "reason": f"Use '{target}' in {target_region}"
            })
    
    return {
        "recommendations": [...],
        "format_changes": guidelines["format"],
        "terminology_changes": terminology_changes,
        "target_region": target_region,
        "date_format": guidelines["date_format"],
        "cultural_notes": guidelines["cultural_notes"]
    }
```

### 4. Display Results

```typescript
<LocalizationModal
  isOpen={localizationOpen}
  onClose={() => setLocalizationOpen(false)}
  result={localizationResult}
/>
```

## 📋 Regional Guidelines

### Format Differences

| Aspect | US | UK | EU | APAC |
|--------|----|----|----|----|
| Document Name | Resume | CV | CV | CV/Resume |
| Photo | No | Optional | Often | Often |
| Age/DOB | No | No | Sometimes | Often |
| Marital Status | No | No | Sometimes | Often |
| Length | 1-2 pages | 2 pages | 2-3 pages | Varies |
| Date Format | MM/DD/YYYY | DD/MM/YYYY | DD.MM.YYYY | Varies |

### Terminology Mapping

**US Terminology**:
- Resume (not CV)
- Cell phone (not Mobile)
- ZIP code (not Postcode)
- Apartment (not Flat)

**UK Terminology**:
- CV (not Resume)
- Mobile (not Cell phone)
- Postcode (not ZIP code)
- Flat (not Apartment)

**EU Terminology**:
- CV or Curriculum Vitae
- Mobile phone
- Postal code
- Varies by country

## 🎨 UI Components

### Region Selector

```typescript
function RegionSelector() {
  const regions = [
    { code: 'US', flag: '🇺🇸', name: 'United States' },
    { code: 'UK', flag: '🇬🇧', name: 'United Kingdom' },
    { code: 'EU', flag: '🇪🇺', name: 'European Union' },
    { code: 'APAC', flag: '🌏', name: 'Asia-Pacific' }
  ]
  
  return (
    <div className="region-selector">
      {regions.map(region => (
        <button
          key={region.code}
          onClick={() => handleLocalization(region.code)}
        >
          {region.flag} {region.name}
        </button>
      ))}
    </div>
  )
}
```

### Localization Modal

```typescript
function LocalizationModal({ result }) {
  const [activeTab, setActiveTab] = useState('recommendations')
  
  return (
    <Modal>
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tab value="recommendations">Recommendations</Tab>
        <Tab value="format">Format</Tab>
        <Tab value="terminology">Terminology</Tab>
        <Tab value="cultural">Cultural Notes</Tab>
      </Tabs>
      
      <TabContent value={activeTab}>
        {/* Display relevant content */}
      </TabContent>
    </Modal>
  )
}
```

## 📊 Performance

- **Response Time**: < 1 second
- **Processing**: Logic-based (no AI)
- **Accuracy**: Based on industry standards
- **Coverage**: 4 major regions

## 🔄 Future Enhancements

- More regions (Middle East, Africa, Latin America)
- Language translation
- Industry-specific guidelines
- Country-specific variations within regions

---

**Status**: ✅ Complete and Production Ready

For full architecture details, see [LOCALIZATION_ARCHITECTURE.md](../LOCALIZATION_ARCHITECTURE.md)
