raw <- readLines("mydata.txt")

# get rid of the "/* 0 */" lines
json <- grep("^/\\* [0-9]* \\*/", raw, value = TRUE, invert = TRUE)

# add missing comma after }
n <- length(json)
json[-n] <- gsub("^}$", "},", json[-n])

# add brakets at the beginning and end
json <- c("[", json, "]")

library(jsonlite)
table <- fromJSON(json)

table[1,2]
flatten(table)[1:3, c(1, 6, 12)]
table <- flatten(fromJSON(json))
tab_list <- lapply(1:nrow(table),
                   function(i) data.frame(table[i, -12], table[i, 12],
                                          stringsAsFactors = FALSE))
library(dplyr)
flat_table <- bind_rows(tab_list)
write.csv(flat_table, file = "mydata.csv")