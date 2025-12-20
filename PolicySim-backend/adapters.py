import logging
import pandas as pd
import geopandas as gpd
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple
from abc import ABC, abstractmethod

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ========================================== 
# SECTOR CONFIGURATION
# ==========================================
SECTOR_FIELD_CONFIG = {
    "HEALTHCARE": {
        "description": "Access to healthcare services and health vulnerabilities",
        "census_fields": [
            "TOT_P", "P_06", "P_SC", "P_ST", "P_ILL", "POVERTY_PROXY", "POP_DENSITY"
        ],
        "derived_metrics": [
            "child_population_ratio", "marginalized_population_pct",
            "health_literacy_gap", "healthcare_demand_index"
        ],
        "external_data": [
            "hospitals_count", "primary_health_centers", "ambulance_response_time_min"
        ]
    },
    "HOUSING": {
        "description": "Housing affordability and living conditions",
        "census_fields": [
            "No_HH", "TOT_P", "P_SC", "P_ST", "POVERTY_PROXY",
            "MAINWORK_P", "MARGWORK_P", "POP_DENSITY"
        ],
        "derived_metrics": [
            "persons_per_household", "precarious_employment_pct",
            "housing_affordability_risk", "vulnerable_households_pct"
        ],
        "external_data": [
            "slum_households_pct", "avg_rent_per_sqft", "informal_settlements_count"
        ]
    },
    "TRANSPORTATION": {
        "description": "Mobility access and infrastructure quality",
        "census_fields": [
            "TOT_WORK_P", "MAINWORK_P", "MARGWORK_P", "P_SC", "P_ST",
            "POVERTY_PROXY", "POP_DENSITY"
        ],
        "derived_metrics": [
            "commuter_density", "transport_dependent_pct",
            "mobility_poverty_risk", "equity_gap_score"
        ],
        "external_data": [
            "bus_stops_count", "metro_stations_within_1km",
            "avg_commute_time_min", "road_quality_index"
        ]
    },
    "EDUCATION": {
        "description": "Educational access and digital divide",
        "census_fields": [
            "P_06", "P_LIT", "P_ILL", "P_SC", "P_ST", "TOT_P",
            "POVERTY_PROXY", "MAINWORK_P"
        ],
        "derived_metrics": [
            "literacy_rate", "child_population_pct",
            "educational_exclusion_risk", "intergenerational_mobility"
        ],
        "external_data": [
            "schools_count", "schools_per_1000_children",
            "student_teacher_ratio", "digital_infrastructure_score"
        ]
    },
    "EMPLOYMENT": {
        "description": "Labor market vulnerability and economic stability",
        "census_fields": [
            "TOT_WORK_P", "MAINWORK_P", "MARGWORK_P", "NON_WORK_P",
            "WORK_PARTICIPATION_RATE", "MAIN_CL_P", "MAIN_AL_P",
            "MAIN_OT_P", "P_SC", "P_ST", "POVERTY_PROXY"
        ],
        "derived_metrics": [
            "employment_precarity_index", "dependency_ratio",
            "sectoral_vulnerability", "economic_marginalization"
        ],
        "external_data": [
            "avg_daily_wage_inr", "informal_sector_pct", "unemployment_rate"
        ]
    },
    "SOCIAL_WELFARE": {
        "description": "Social protection and systemic exclusion",
        "census_fields": [
            "P_SC", "P_ST", "P_06", "P_ILL", "POVERTY_PROXY",
            "MARGWORK_P", "SEX_RATIO", "TOT_F"
        ],
        "derived_metrics": [
            "welfare_eligible_pct", "gender_vulnerability_index",
            "social_exclusion_score", "policy_reach_priority"
        ],
        "external_data": [
            "ration_card_holders", "aadhaar_penetration_pct",
            "bank_account_coverage_pct"
        ]
    }
}

# ========================================== 
# CUSTOM EXCEPTIONS
# ==========================================
class AdapterError(Exception):
    """Base class for adapter-related errors."""
    pass

class DataMissingError(AdapterError):
    """Raised when required data files are missing."""
    pass

class InvalidCityError(AdapterError):
    """Raised when city is not supported."""
    pass

class InvalidSectorError(AdapterError):
    """Raised when sector is not supported."""
    pass

# ========================================== 
# DATA CONFIGURATION
# ==========================================
class DataConfig:
    """Configuration for data file paths and supported cities."""
    
    SUPPORTED_CITIES = [
        "bangalore", "chennai", "delhi", "hyderabad",
        "kolkata", "mumbai", "pune"
    ]
    
    BASE_DIR = Path("census_data")
    
    @classmethod
    def get_csv_path(cls, city: str) -> Path:
        """Get CSV file path for a city."""
        city_lower = city.lower()
        if city_lower == "bangalore":
            return cls.BASE_DIR / "bangalore_data_census.csv"
        return cls.BASE_DIR / f"{city_lower}_census_data.csv"
    
    @classmethod
    def get_geojson_path(cls, city: str) -> Path:
        """Get GeoJSON file path for a city."""
        city_lower = city.lower()
        return cls.BASE_DIR / f"{city_lower}_wards_standardized.geojson"
    
    @classmethod
    def validate_city(cls, city: str) -> str:
        """Validate and normalize city name."""
        city_lower = city.lower().strip()
        if city_lower not in cls.SUPPORTED_CITIES:
            raise InvalidCityError(
                f"City '{city}' not supported. "
                f"Valid cities: {', '.join(cls.SUPPORTED_CITIES)}"
            )
        return city_lower

# ========================================== 
# BASE ADAPTER
# ==========================================
class BaseSectorAdapter(ABC):
    """Abstract base class for sector-specific data adapters."""
    
    def __init__(self, sector_name: str):
        self.sector_name = sector_name.upper()
        self._validate_sector()
        self.config = SECTOR_FIELD_CONFIG[self.sector_name]
    
    def _validate_sector(self):
        """Validate sector name."""
        if self.sector_name not in SECTOR_FIELD_CONFIG:
            valid_sectors = ", ".join(SECTOR_FIELD_CONFIG.keys())
            raise InvalidSectorError(
                f"Sector '{self.sector_name}' not supported. "
                f"Valid sectors: {valid_sectors}"
            )
    
    def get_required_fields(self) -> List[str]:
        """Get all required fields for this sector."""
        base_fields = ["State_Code", "Town_Code", "Ward_Name", "area_km2"]
        sector_fields = (
            self.config["census_fields"] +
            self.config["derived_metrics"] +
            self.config["external_data"]
        )
        return base_fields + sector_fields
    
    def get_field_categories(self) -> Dict[str, List[str]]:
        """Get fields organized by category."""
        return {
            "base": ["State_Code", "Town_Code", "Ward_Name", "area_km2"],
            "census": self.config["census_fields"],
            "derived": self.config["derived_metrics"],
            "external": self.config["external_data"]
        }
    
    @abstractmethod
    def fetch_data(self, city: str, ward_filter: Optional[List[str]] = None) -> Tuple[gpd.GeoDataFrame, pd.DataFrame]:
        """Fetch and process data for the sector."""
        pass

# ========================================== 
# SECTOR-SPECIFIC ADAPTERS
# ==========================================
class HealthcareAdapter(BaseSectorAdapter):
    """Healthcare sector data adapter."""
    
    def __init__(self):
        super().__init__("HEALTHCARE")
    
    def fetch_data(self, city: str, ward_filter: Optional[List[str]] = None) -> Tuple[gpd.GeoDataFrame, pd.DataFrame]:
        """Fetch healthcare-specific data."""
        city = DataConfig.validate_city(city)
        
        # Load data
        csv_path = DataConfig.get_csv_path(city)
        geojson_path = DataConfig.get_geojson_path(city)
        
        if not csv_path.exists():
            raise DataMissingError(f"CSV file not found: {csv_path}")
        if not geojson_path.exists():
            raise DataMissingError(f"GeoJSON file not found: {geojson_path}")
        
        logger.info(f"Loading healthcare data for {city.title()}")
        
        # Load data
        gdf = gpd.read_file(geojson_path)
        df = pd.read_csv(csv_path)
        df.columns = [c.strip() for c in df.columns]
        column_mapping = {
            'ward_name': 'Ward_Name',
            'Ward Name': 'Ward_Name',
            'WARD_NAME': 'Ward_Name',
            'ward_no': 'Ward_Name', # Fallback if names aren't present
            'Ward_No': 'Ward_Name'
        }
        df = df.rename(columns=column_mapping)
        
        # Filter fields
        required_fields = self.get_required_fields()
        available_fields = [f for f in required_fields if f in df.columns]
        
        if len(available_fields) < len(required_fields):
            missing = set(required_fields) - set(available_fields)
            logger.warning(f"Missing fields: {missing}")
        
        df_filtered = df[available_fields]
        
        # Apply ward filter if provided
        if ward_filter:
            df_filtered = df_filtered[df_filtered['Ward_Name'].isin(ward_filter)]
            gdf = gdf[gdf['ward_name'].isin(ward_filter)]
        
        logger.info(f"Fetched {len(df_filtered)} wards with {len(available_fields)} fields")
        
        return gdf, df_filtered

class HousingAdapter(BaseSectorAdapter):
    """Housing sector data adapter."""
    
    def __init__(self):
        super().__init__("HOUSING")
    
    def fetch_data(self, city: str, ward_filter: Optional[List[str]] = None) -> Tuple[gpd.GeoDataFrame, pd.DataFrame]:
        city = DataConfig.validate_city(city)
        csv_path = DataConfig.get_csv_path(city)
        geojson_path = DataConfig.get_geojson_path(city)
        
        if not csv_path.exists():
            raise DataMissingError(f"CSV file not found: {csv_path}")
        if not geojson_path.exists():
            raise DataMissingError(f"GeoJSON file not found: {geojson_path}")
        
        logger.info(f"Loading housing data for {city.title()}")
        
        gdf = gpd.read_file(geojson_path)
        df = pd.read_csv(csv_path)
        
        required_fields = self.get_required_fields()
        available_fields = [f for f in required_fields if f in df.columns]
        df_filtered = df[available_fields]
        
        if ward_filter:
            df_filtered = df_filtered[df_filtered['Ward_Name'].isin(ward_filter)]
            gdf = gdf[gdf['ward_name'].isin(ward_filter)]
        
        logger.info(f"Fetched {len(df_filtered)} wards with {len(available_fields)} fields")
        return gdf, df_filtered

class TransportationAdapter(BaseSectorAdapter):
    """Transportation sector data adapter."""
    
    def __init__(self):
        super().__init__("TRANSPORTATION")
    
    def fetch_data(self, city: str, ward_filter: Optional[List[str]] = None) -> Tuple[gpd.GeoDataFrame, pd.DataFrame]:
        city = DataConfig.validate_city(city)
        csv_path = DataConfig.get_csv_path(city)
        geojson_path = DataConfig.get_geojson_path(city)
        
        if not csv_path.exists():
            raise DataMissingError(f"CSV file not found: {csv_path}")
        if not geojson_path.exists():
            raise DataMissingError(f"GeoJSON file not found: {geojson_path}")
        
        logger.info(f"Loading transportation data for {city.title()}")
        
        gdf = gpd.read_file(geojson_path)
        df = pd.read_csv(csv_path)
        
        required_fields = self.get_required_fields()
        available_fields = [f for f in required_fields if f in df.columns]
        df_filtered = df[available_fields]
        
        if ward_filter:
            df_filtered = df_filtered[df_filtered['Ward_Name'].isin(ward_filter)]
            gdf = gdf[gdf['ward_name'].isin(ward_filter)]
        
        logger.info(f"Fetched {len(df_filtered)} wards with {len(available_fields)} fields")
        return gdf, df_filtered

class EducationAdapter(BaseSectorAdapter):
    """Education sector data adapter."""
    
    def __init__(self):
        super().__init__("EDUCATION")
    
    def fetch_data(self, city: str, ward_filter: Optional[List[str]] = None) -> Tuple[gpd.GeoDataFrame, pd.DataFrame]:
        city = DataConfig.validate_city(city)
        csv_path = DataConfig.get_csv_path(city)
        geojson_path = DataConfig.get_geojson_path(city)
        
        if not csv_path.exists():
            raise DataMissingError(f"CSV file not found: {csv_path}")
        if not geojson_path.exists():
            raise DataMissingError(f"GeoJSON file not found: {geojson_path}")
        
        logger.info(f"Loading education data for {city.title()}")
        
        gdf = gpd.read_file(geojson_path)
        df = pd.read_csv(csv_path)
        
        required_fields = self.get_required_fields()
        available_fields = [f for f in required_fields if f in df.columns]
        df_filtered = df[available_fields]
        
        if ward_filter:
            df_filtered = df_filtered[df_filtered['Ward_Name'].isin(ward_filter)]
            gdf = gdf[gdf['ward_name'].isin(ward_filter)]
        
        logger.info(f"Fetched {len(df_filtered)} wards with {len(available_fields)} fields")
        return gdf, df_filtered

class EmploymentAdapter(BaseSectorAdapter):
    """Employment sector data adapter."""
    
    def __init__(self):
        super().__init__("EMPLOYMENT")
    
    def fetch_data(self, city: str, ward_filter: Optional[List[str]] = None) -> Tuple[gpd.GeoDataFrame, pd.DataFrame]:
        city = DataConfig.validate_city(city)
        csv_path = DataConfig.get_csv_path(city)
        geojson_path = DataConfig.get_geojson_path(city)
        
        if not csv_path.exists():
            raise DataMissingError(f"CSV file not found: {csv_path}")
        if not geojson_path.exists():
            raise DataMissingError(f"GeoJSON file not found: {geojson_path}")
        
        logger.info(f"Loading employment data for {city.title()}")
        
        gdf = gpd.read_file(geojson_path)
        df = pd.read_csv(csv_path)
        
        required_fields = self.get_required_fields()
        available_fields = [f for f in required_fields if f in df.columns]
        df_filtered = df[available_fields]
        
        if ward_filter:
            df_filtered = df_filtered[df_filtered['Ward_Name'].isin(ward_filter)]
            gdf = gdf[gdf['ward_name'].isin(ward_filter)]
        
        logger.info(f"Fetched {len(df_filtered)} wards with {len(available_fields)} fields")
        return gdf, df_filtered

class SocialWelfareAdapter(BaseSectorAdapter):
    """Social Welfare sector data adapter."""
    
    def __init__(self):
        super().__init__("SOCIAL_WELFARE")
    
    def fetch_data(self, city: str, ward_filter: Optional[List[str]] = None) -> Tuple[gpd.GeoDataFrame, pd.DataFrame]:
        city = DataConfig.validate_city(city)
        csv_path = DataConfig.get_csv_path(city)
        geojson_path = DataConfig.get_geojson_path(city)
        
        if not csv_path.exists():
            raise DataMissingError(f"CSV file not found: {csv_path}")
        if not geojson_path.exists():
            raise DataMissingError(f"GeoJSON file not found: {geojson_path}")
        
        logger.info(f"Loading social welfare data for {city.title()}")
        
        gdf = gpd.read_file(geojson_path)
        df = pd.read_csv(csv_path)
        
        required_fields = self.get_required_fields()
        available_fields = [f for f in required_fields if f in df.columns]
        df_filtered = df[available_fields]
        
        if ward_filter:
            df_filtered = df_filtered[df_filtered['Ward_Name'].isin(ward_filter)]
            gdf = gdf[gdf['ward_name'].isin(ward_filter)]
        
        logger.info(f"Fetched {len(df_filtered)} wards with {len(available_fields)} fields")
        return gdf, df_filtered

# ========================================== 
# ADAPTER FACTORY
# ==========================================
class AdapterFactory:
    """Factory for creating sector-specific adapters."""
    
    REGISTRY = {
        "HEALTHCARE": HealthcareAdapter,
        "HOUSING": HousingAdapter,
        "TRANSPORTATION": TransportationAdapter,
        "EDUCATION": EducationAdapter,
        "EMPLOYMENT": EmploymentAdapter,
        "SOCIAL_WELFARE": SocialWelfareAdapter
    }
    
    @classmethod
    def get_adapter(cls, sector: str) -> BaseSectorAdapter:
        """Get adapter for specified sector."""
        if not isinstance(sector, str):
            raise ValueError(f"Sector must be a string, got {type(sector)}")
        
        sector_key = sector.upper().strip()
        adapter_class = cls.REGISTRY.get(sector_key)
        
        if not adapter_class:
            valid_keys = ", ".join(cls.REGISTRY.keys())
            raise InvalidSectorError(
                f"Unknown sector: '{sector}'. Valid sectors are: {valid_keys}"
            )
        
        return adapter_class()
    
    @classmethod
    def list_sectors(cls) -> List[str]:
        """List all available sectors."""
        return list(cls.REGISTRY.keys())

# ========================================== 
# HIGH-LEVEL API
# ==========================================
def fetch_sector_data(
    city: str,
    sector: str,
    ward_filter: Optional[List[str]] = None
) -> Tuple[gpd.GeoDataFrame, pd.DataFrame]:
    """
    High-level API to fetch sector-specific data for a city.
    
    Args:
        city: City name (bangalore, chennai, delhi, etc.)
        sector: Sector name (HEALTHCARE, HOUSING, etc.)
        ward_filter: Optional list of ward names to filter
    
    Returns:
        Tuple of (GeoDataFrame, DataFrame) with sector-specific fields
    
    Example:
        >>> gdf, df = fetch_sector_data("bangalore", "HEALTHCARE")
        >>> print(df.columns)
        >>> print(len(gdf))
    """
    try:
        adapter = AdapterFactory.get_adapter(sector)
        return adapter.fetch_data(city, ward_filter)
    except Exception as e:
        logger.error(f"Error fetching data: {str(e)}")
        raise

def get_sector_info(sector: str) -> Dict[str, Any]:
    """Get information about a sector's fields and configuration."""
    sector_key = sector.upper().strip()
    if sector_key not in SECTOR_FIELD_CONFIG:
        raise InvalidSectorError(f"Unknown sector: {sector}")
    
    adapter = AdapterFactory.get_adapter(sector_key)
    return {
        "sector": sector_key,
        "description": adapter.config["description"],
        "field_categories": adapter.get_field_categories(),
        "total_fields": len(adapter.get_required_fields())
    }

# ========================================== 
# EXAMPLE USAGE
# ==========================================
if __name__ == "__main__":
    # Example 1: Fetch healthcare data for Bangalore
    # print("=" * 60)
    # # print("Example 1: Healthcare data for Bangalore")
    # print("=" * 60)
    
    try:
        gdf, df = fetch_sector_data("Hyderabad", "SOCIAL_WELFARE")
        print(f"\n✅ Loaded {len(df)} wards")
        print(f"📊 Columns: {list(df.columns)}")
        print(f"\n🗺️  GeoDataFrame shape: {gdf.shape}")
        print(f"📈 DataFrame shape: {df.shape}")
    except Exception as e:
        print(f"❌ Error: {str(e)}")
    
    # # Example 2: Get sector information
    # print("\n" + "=" * 60)
    # print("Example 2: Sector Information")
    # print("=" * 60)
    
    # for sector in ["HEALTHCARE", "EDUCATION", "TRANSPORTATION"]:
    #     info = get_sector_info(sector)
    #     print(f"\n🏥 {info['sector']}")
    #     print(f"   Description: {info['description']}")
    #     print(f"   Total Fields: {info['total_fields']}")
    #     print(f"   Census Fields: {len(info['field_categories']['census'])}")
    #     print(f"   Derived Metrics: {len(info['field_categories']['derived'])}")
    #     print(f"   External Data: {len(info['field_categories']['external'])}")
    
    # Example 3: List all available resources
    # print("\n" + "=" * 60)
    # print("Example 3: Available Resources")
    # print("=" * 60)
    
    print(f"\n🏙️  Supported Cities: {', '.join(DataConfig.SUPPORTED_CITIES)}")
    print(f"🏢 Available Sectors: {', '.join(AdapterFactory.list_sectors())}")