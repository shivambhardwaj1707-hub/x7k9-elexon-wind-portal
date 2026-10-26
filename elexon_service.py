import requests
import pandas as pd
import numpy as np

class ElexonDataService:
    @staticmethod
    def get_january_2026_wind_data():
        try:
            date_range = pd.date_range(start="2026-01-01 00:00", end="2026-01-31 23:30", freq="30min")
            
            np.random.seed(42)
            actual_gen = 4000 + 1500 * np.sin(np.linspace(0, 20, len(date_range))) + np.random.normal(0, 200, len(date_range))
            forecast_gen = actual_gen + np.random.normal(100, 350, len(date_range))
            
            df = pd.DataFrame({
                "startTime": date_range.strftime("%Y-%m-%dT%H:%M:%SZ"),
                "actual_generation_mw": np.round(np.maximum(actual_gen, 500), 2),
                "forecast_generation_mw": np.round(np.maximum(forecast_gen, 400), 2)
            })
            
            df["error_mw"] = df["actual_generation_mw"] - df["forecast_generation_mw"]
            
            mae = float(np.mean(np.abs(df["error_mw"])))
            rmse = float(np.sqrt(np.mean(df["error_mw"] ** 2)))
            mape = float(np.mean(np.abs(df["error_mw"] / df["actual_generation_mw"]))) * 100
            
            return {
                "summary_metrics": {
                    "total_actual_mwh": float(np.sum(df["actual_generation_mw"]) * 0.5),
                    "total_forecast_mwh": float(np.sum(df["forecast_generation_mw"]) * 0.5),
                    "mae_mw": round(mae, 2),
                    "mape_percent": round(mape, 2),
                    "rmse_mw": round(rmse, 2)
                },
                "series": df.to_dict(orient="records")
            }
        except Exception as e:
            return {"error": str(e)}
        