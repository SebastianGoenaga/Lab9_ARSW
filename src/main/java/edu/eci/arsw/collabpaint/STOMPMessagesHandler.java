package edu.eci.arsw.collabpaint;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import edu.eci.arsw.collabpaint.model.Point;

@Controller
public class STOMPMessagesHandler {

	@Autowired
	SimpMessagingTemplate msgt;

	ConcurrentHashMap<String, List<Point>> cls = new ConcurrentHashMap<String, List<Point>>();

	@MessageMapping("/newpoint.{numdibujo}")
	public void handlePointEvent(Point pt, @DestinationVariable String numdibujo) throws Exception {
		
		
		if (cls.get(numdibujo)==null) {
			cls.put(numdibujo, Collections.synchronizedList(new ArrayList<Point>()));

		}
		synchronized (cls.get(numdibujo)) {
			List<Point> puntos = cls.get(numdibujo);
			System.out.println("Nuevo punto recibido en el servidor!:" + pt);
			msgt.convertAndSend("/topic/newpoint."+numdibujo, pt);
			puntos.add(pt);
			if (puntos.size()==4) {
				msgt.convertAndSend("/topic/newpolygon." + numdibujo, puntos);
				puntos.clear();
			}
			
			
		}
	}
}
