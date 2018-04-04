import pandas as pd  
import numpy as np

df = pd.read_csv('No_of_Road_Acc.csv')
# print(df.head())

# nparr = np.array(df)
df.set_index('States', inplace=True)

df=df.fillna(0)

max = df.values.max()
min = df.values.min()
print(max, min)


# python -m http.server



