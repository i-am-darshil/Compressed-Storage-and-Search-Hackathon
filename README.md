# Logging Solution based on Compressed Log Processor

<img width="1452" alt="Alexa Excellence Hackathon Winner" src="https://github.com/i-am-darshil/Compressed-Storage-and-Search-Hackathon/assets/34602679/7ac2eb15-13bd-42b7-b6a9-267daa7d6619">

## Scenario
For any service, in order to troubleshoot its systems or improving applications, the ability to freely analyse the logs is primary. Managing logs for massive services like Alexa which logs trillions of logs every day is challenging. Its challenging because the storage and search of these huge piles of logs comes with significant cost.

As part of hackathon, we were able to model a logging ecosystem that uses compression based storage and search. We leveraged CLP (Compressed Log Processor), a tool that can losslessly compress text logs, and allows users to directly search the compressed logs without the need for decompression. We were able to store logs with almost twice the compression ratio of Gzip and at the same time enabled wildcard based search on their compressed logs.

## Background of CLP

![Backgroud-CLP](https://github.com/i-am-darshil/Compressed-Storage-and-Search-Hackathon/assets/34602679/760e7a4f-9e9b-484f-9a12-0769c2324737)

In the first step, CLP deterministically parses the message into a timestamp, a list of variable values, and the log type. It further recognizes that some variable values like task ID and container ID are likely repetitive, whereas others, like floating-point numbers or integers are non-repetitive. The former are called dictionary variables because they will be stored in a dictionary whereas the latter are called non-dictionary variables.

The next two steps convert the different string components into concise binary values. In step 2, CLP encodes the timestamp and non-dictionary variables. For timestamps, it encodes the delta in milliseconds (compared to the timestamp of the last message) using a variable-length encoding scheme, hence most timestamps only occupy one or two bytes. Floating-point numbers are encoded using our custom algorithm described below. In step 3, each repetitive variable is deduplicated using a dictionary. Similarly, the log type is also deduplicated using a separate (log type) dictionary.

In the last step, CLP converts the log messages into a table of encoded messages consisting of three columns: the timestamp, a list of variable values (either the variable dictionary IDs or encoded non-dictionary values), and the log type ID. Once a number of log messages is buffered, each column is compressed (in column-oriented order) using Zstandard. The dictionaries are also compressed separately using Zstandard.

$$ Hackathon Design and Implementation

![Architecture-CLP](https://github.com/i-am-darshil/Compressed-Storage-and-Search-Hackathon/assets/34602679/5a6dc8a5-655d-40e2-9786-8d02c3d9450e)

1. Customer logs are sent into S3, which triggers a SQS notification for the backend to ingest.
2. The Backend consists of EC2 instances which hosts CLP and a nodeJS server to serve the requests
3. The server polls the SQS queues and downloads the logs from S3. The logs in S3 can be deleted.
4. The server ingests the logs into CLP. Here on, the logs are stored in a compressed format.
5. When a user queries the logs using text/wildcard based queries, the client relays the requests to the backend server.
6. CLP searches through the logs in the compressed format itself, without the need to decompress it.
7. Once the results are found, only the required logs will be decompressed and are sent back to the user interface as response.
   
Demo : https://drive.google.com/file/d/12Zmn8jj7EaJbvixfS5VKClHL_UEnWZLB/view?pli=1

## Hackathon Results - 🌟Winner🌟
We were able to store logs with almost twice the compression ratio of Gzip and at the same time enabled wildcard based search on their compressed logs

CLP
```
+-----------------------+---------------------+-------------------+
| log_uncompressed_size | log_compressed_size | compression_ratio |
+-----------------------+---------------------+-------------------+
|            1.46GB     |            19.8MB   |           73.7734 |
+-----------------------+---------------------+-------------------+
      
        
Gzip
+-----------------------+---------------------+-------------------+
| log_uncompressed_size | log_compressed_size | compression_ratio |
+-----------------------+---------------------+-------------------+
|            1.46GB     |            37MB     |           39.6548 |
+-----------------------+---------------------+-------------------+
```

## How Well does CLP work?

Compression Ratio

![](https://miro.medium.com/v2/resize:fit:834/0*iE-5v45WAxLXdf4e)

Log Ingestion Speed

![](https://miro.medium.com/v2/resize:fit:1400/0*UGifH9gmuMe7I7Iy)

Log Search Performance

![](https://miro.medium.com/v2/resize:fit:1400/0*_K3PFbvhyzf0ifvS)


