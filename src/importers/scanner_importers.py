"""
Scanner Result Importers for BugStore

Supports importing results from:
- Burp Suite (XML)
- OWASP ZAP (JSON/XML)
- Nuclei (JSON)
- BugTraceAI (JSON)
"""

import json
import xml.etree.ElementTree as ET
from typing import List, Dict, Any
from dataclasses import dataclass
from datetime import datetime


@dataclass
class Finding:
    """Standardized vulnerability finding"""
    scanner: str
    vuln_id: str = None  # Mapped to V-001, V-002, etc.
    name: str = ""
    severity: str = ""
    url: str = ""
    parameter: str = ""
    description: str = ""
    evidence: str = ""
    confidence: str = ""
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'scanner': self.scanner,
            'vuln_id': self.vuln_id,
            'name': self.name,
            'severity': self.severity,
            'url': self.url,
            'parameter': self.parameter,
            'description': self.description,
            'evidence': self.evidence,
            'confidence': self.confidence
        }


class BurpImporter:
    """Import Burp Suite XML results"""
    
    @staticmethod
    def parse(xml_file: str) -> List[Finding]:
        findings = []
        tree = ET.parse(xml_file)
        root = tree.getroot()
        
        for issue in root.findall('.//issue'):
            finding = Finding(
                scanner='Burp Suite',
                name=issue.find('name').text if issue.find('name') is not None else '',
                severity=issue.find('severity').text if issue.find('severity') is not None else '',
                url=issue.find('host').text if issue.find('host') is not None else '',
                description=issue.find('issueDetail').text if issue.find('issueDetail') is not None else '',
                confidence=issue.find('confidence').text if issue.find('confidence') is not None else ''
            )
            findings.append(finding)
        
        return findings


class ZAPImporter:
    """Import OWASP ZAP JSON/XML results"""
    
    @staticmethod
    def parse_json(json_file: str) -> List[Finding]:
        with open(json_file, 'r') as f:
            data = json.load(f)
        
        findings = []
        
        # ZAP JSON structure: site -> alerts
        for site in data.get('site', []):
            for alert in site.get('alerts', []):
                for instance in alert.get('instances', []):
                    finding = Finding(
                        scanner='OWASP ZAP',
                        name=alert.get('name', ''),
                        severity=alert.get('riskdesc', '').split()[0],  # "High (Medium)" -> "High"
                        url=instance.get('uri', ''),
                        parameter=instance.get('param', ''),
                        description=alert.get('desc', ''),
                        evidence=instance.get('evidence', ''),
                        confidence=alert.get('confidence', '')
                    )
                    findings.append(finding)
        
        return findings
    
    @staticmethod
    def parse_xml(xml_file: str) -> List[Finding]:
        findings = []
        tree = ET.parse(xml_file)
        root = tree.getroot()
        
        for alertitem in root.findall('.//alertitem'):
            finding = Finding(
                scanner='OWASP ZAP',
                name=alertitem.find('name').text if alertitem.find('name') is not None else '',
                severity=alertitem.find('riskdesc').text if alertitem.find('riskdesc') is not None else '',
                url=alertitem.find('uri').text if alertitem.find('uri') is not None else '',
                description=alertitem.find('desc').text if alertitem.find('desc') is not None else ''
            )
            findings.append(finding)
        
        return findings


class NucleiImporter:
    """Import Nuclei JSON results"""
    
    @staticmethod
    def parse(json_file: str) -> List[Finding]:
        findings = []
        
        with open(json_file, 'r') as f:
            for line in f:
                try:
                    data = json.loads(line.strip())
                    
                    finding = Finding(
                        scanner='Nuclei',
                        name=data.get('info', {}).get('name', ''),
                        severity=data.get('info', {}).get('severity', ''),
                        url=data.get('matched-at', ''),
                        description=data.get('info', {}).get('description', ''),
                        evidence=data.get('matched-line', '')
                    )
                    findings.append(finding)
                except json.JSONDecodeError:
                    continue
        
        return findings


class BugTraceAIImporter:
    """Import BugTraceAI JSON results"""
    
    @staticmethod
    def parse(json_file: str) -> List[Finding]:
        with open(json_file, 'r') as f:
            data = json.load(f)
        
        findings = []
        
        for vuln in data.get('vulnerabilities', []):
            finding = Finding(
                scanner='BugTraceAI',
                vuln_id=vuln.get('id'),  # Already mapped to V-XXX
                name=vuln.get('name', ''),
                severity=vuln.get('severity', ''),
                url=vuln.get('url', ''),
                parameter=vuln.get('parameter', ''),
                description=vuln.get('description', ''),
                evidence=vuln.get('proof_of_concept', ''),
                confidence=vuln.get('confidence', '')
            )
            findings.append(finding)
        
        return findings


class VulnerabilityMapper:
    """Map scanner findings to BugStore vulnerability IDs"""
    
    MAPPING_RULES = {
        'V-001': {
            'keywords': ['sql injection', 'sqli'],
            'endpoints': ['/api/products'],
            'parameters': ['search', 'category']
        },
        'V-002': {
            'keywords': ['xss', 'cross-site scripting', 'reflected'],
            'endpoints': ['/products'],
            'parameters': ['search']
        },
        'V-003': {
            'keywords': ['xss', 'stored', 'persistent'],
            'endpoints': ['/api/reviews'],
            'parameters': ['text', 'comment']
        },
        'V-005': {
            'keywords': ['open redirect', 'unvalidated redirect'],
            'endpoints': ['/api/redirect'],
            'parameters': ['url']
        },
        'V-009': {
            'keywords': ['idor', 'insecure direct object'],
            'endpoints': ['/api/orders'],
            'parameters': ['id']
        },
        'V-014': {
            'keywords': ['path traversal', 'directory traversal'],
            'endpoints': ['/api/products', '/image'],
            'parameters': ['file', 'path']
        },
        'V-020': {
            'keywords': ['graphql', 'information disclosure'],
            'endpoints': ['/api/graphql'],
            'parameters': []
        },
        'V-021': {
            'keywords': ['remote code execution', 'rce', 'command injection'],
            'endpoints': ['/api/health'],
            'parameters': ['cmd']
        }
    }
    
    @staticmethod
    def map_finding(finding: Finding) -> str:
        """Attempt to map a finding to a BugStore vulnerability ID"""
        
        # If already mapped (e.g., BugTraceAI), return it
        if finding.vuln_id:
            return finding.vuln_id
        
        # Try to match based on rules
        for vuln_id, rules in VulnerabilityMapper.MAPPING_RULES.items():
            # Check keywords
            keyword_match = any(
                kw.lower() in finding.name.lower() or kw.lower() in finding.description.lower()
                for kw in rules['keywords']
            )
            
            # Check endpoints
            endpoint_match = any(
                ep in finding.url
                for ep in rules['endpoints']
            )
            
            # Check parameters
            param_match = not rules['parameters'] or any(
                param.lower() in finding.parameter.lower()
                for param in rules['parameters']
            )
            
            if keyword_match and endpoint_match and param_match:
                return vuln_id
        
        return None


class ResultAggregator:
    """Aggregate and analyze scanner results"""
    
    def __init__(self):
        self.findings: List[Finding] = []
        self.mapped_vulns: Dict[str, List[Finding]] = {}
    
    def add_findings(self, findings: List[Finding]):
        """Add findings and map them"""
        for finding in findings:
            vuln_id = VulnerabilityMapper.map_finding(finding)
            finding.vuln_id = vuln_id
            self.findings.append(finding)
            
            if vuln_id:
                if vuln_id not in self.mapped_vulns:
                    self.mapped_vulns[vuln_id] = []
                self.mapped_vulns[vuln_id].append(finding)
    
    def get_detection_rate(self) -> float:
        """Calculate detection rate (28 total vulnerabilities)"""
        total_vulns = 28  # V-015 and V-016 not implemented
        detected = len(self.mapped_vulns)
        return (detected / total_vulns) * 100
    
    def get_tier_stats(self) -> Dict[str, int]:
        """Get detection stats by tier"""
        tier1_ids = ['V-001', 'V-002', 'V-003', 'V-005', 'V-008', 'V-009', 'V-010', 
                     'V-014', 'V-017', 'V-019', 'V-025', 'V-030']
        tier2_ids = ['V-004', 'V-006', 'V-007', 'V-011', 'V-012', 'V-013', 'V-018', 
                     'V-020', 'V-023', 'V-028']
        tier3_ids = ['V-021', 'V-026', 'V-027']
        
        return {
            'tier1_detected': sum(1 for v in tier1_ids if v in self.mapped_vulns),
            'tier1_total': len(tier1_ids),
            'tier2_detected': sum(1 for v in tier2_ids if v in self.mapped_vulns),
            'tier2_total': len(tier2_ids),
            'tier3_detected': sum(1 for v in tier3_ids if v in self.mapped_vulns),
            'tier3_total': len(tier3_ids)
        }
    
    def generate_report(self) -> Dict[str, Any]:
        """Generate comprehensive report"""
        tier_stats = self.get_tier_stats()
        
        return {
            'timestamp': datetime.now().isoformat(),
            'total_findings': len(self.findings),
            'unique_vulnerabilities': len(self.mapped_vulns),
            'detection_rate': self.get_detection_rate(),
            'tier_stats': tier_stats,
            'detected_vulnerabilities': list(self.mapped_vulns.keys()),
            'findings_by_scanner': self._group_by_scanner(),
            'unmapped_findings': [
                f.to_dict() for f in self.findings if not f.vuln_id
            ]
        }
    
    def _group_by_scanner(self) -> Dict[str, int]:
        """Group findings by scanner"""
        scanners = {}
        for finding in self.findings:
            scanners[finding.scanner] = scanners.get(finding.scanner, 0) + 1
        return scanners


# CLI Usage Example
if __name__ == '__main__':
    import sys
    
    if len(sys.argv) < 3:
        print("Usage: python importers.py <scanner> <file>")
        print("Scanners: burp, zap-json, zap-xml, nuclei, bugtraceai")
        sys.exit(1)
    
    scanner_type = sys.argv[1]
    file_path = sys.argv[2]
    
    # Parse based on scanner type
    if scanner_type == 'burp':
        findings = BurpImporter.parse(file_path)
    elif scanner_type == 'zap-json':
        findings = ZAPImporter.parse_json(file_path)
    elif scanner_type == 'zap-xml':
        findings = ZAPImporter.parse_xml(file_path)
    elif scanner_type == 'nuclei':
        findings = NucleiImporter.parse(file_path)
    elif scanner_type == 'bugtraceai':
        findings = BugTraceAIImporter.parse(file_path)
    else:
        print(f"Unknown scanner: {scanner_type}")
        sys.exit(1)
    
    # Aggregate and analyze
    aggregator = ResultAggregator()
    aggregator.add_findings(findings)
    
    # Generate report
    report = aggregator.generate_report()
    
    # Print results
    print(json.dumps(report, indent=2))
    
    print(f"\n=== Summary ===")
    print(f"Detection Rate: {report['detection_rate']:.1f}%")
    print(f"Vulnerabilities Found: {report['unique_vulnerabilities']}/28")
    print(f"Tier 1: {report['tier_stats']['tier1_detected']}/{report['tier_stats']['tier1_total']}")
    print(f"Tier 2: {report['tier_stats']['tier2_detected']}/{report['tier_stats']['tier2_total']}")
    print(f"Tier 3: {report['tier_stats']['tier3_detected']}/{report['tier_stats']['tier3_total']}")
