import pandas as pd
import numpy as np
import pickle
# Loding the saved model
loded_model=pickle.load(open("Trained_model.sav",'rb'))
input_data=(0,0,0,0,0,0,0,0)
# changing the input data to numpy array
input_data_as_np_array=np.asarray(input_data)
# reshape the array as we are predicting for one instance
input_data_reshaped=input_data_as_np_array.reshape(1,-1)
prediction=loded_model.predict(input_data_reshaped)
if (prediction[0]==0):
    print("The person does not have heart disease") 
else:
    print("The person has heart disease")
    