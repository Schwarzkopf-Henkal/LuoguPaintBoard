from PIL import Image
import json
DataPath = "plan.json"
Data2Path = "preview.js"
board = []
with open("./Pics/maps.json", 'r') as f:
    maps=json.loads(f.read())
    f.close()
for pic in maps:
    if pic["skip"]:
        continue
    try:
        im = Image.open("./Pics/"+pic["path"])
    except:
        print('Open image ' + pic["path"] + ' failed.')
        quit()
    if im.mode != "P":
        print(pic["path"]+"Index image required.")
        quit()
    img_array = im.load()
    w, h = im.size
    for i in range(w):
        for j in range(h):
            board.append([i + int(pic["x"]), j + int(pic["y"]), img_array[i, j]])
board = json.dumps(board)
with open(DataPath, 'w+') as f:
    f.write(board)
    f.close()
with open(Data2Path, 'w+') as f:
    f.write("var board = " + board)
    f.close()
print("Finished.")
